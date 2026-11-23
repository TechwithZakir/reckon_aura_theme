"""Ask Aura AI agents: a registered app assistant takes the chat and the page keeps its state. Runs without a Frappe site."""

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("aura_test_support", HERE / "test_fill_with_ai.py")
support = importlib.util.module_from_spec(spec)
sys.modules.setdefault("aura_test_support", support)
spec.loader.exec_module(support)

JS = Path(__file__).resolve().parents[1] / "reckon_aura_theme" / "public" / "js" / "aura_desk.js"


class AgentTests(unittest.TestCase):
    def setUp(self):
        self.api, self.frappe, _cache = support.load_api()
        self.frappe.get_hooks = Mock(return_value={"hrms_setup": "reckon_hrms.ai_agent.chat"})
        self.calls = []

        def agent(message, state):
            self.calls.append((message, state))
            return {"reply": "Which country?", "state": {"idx": 1}, "replies": ["India", "Bangladesh"], "done": False}

        self.frappe.get_attr = Mock(return_value=agent)

    def test_a_registered_agent_answers_and_keeps_its_state(self):
        out = self.api._run_agent("hrms_setup", "start", None)
        self.assertEqual((out["answer"], out["agent"], out["agent_state"]), ("Which country?", "hrms_setup", {"idx": 1}))
        self.assertEqual(out["replies"], ["India", "Bangladesh"])
        self.frappe.get_attr.assert_called_with("reckon_hrms.ai_agent.chat")

    def test_frappe_hands_hook_values_back_in_lists(self):
        self.frappe.get_hooks = Mock(return_value={"hrms_setup": ["reckon_hrms.ai_agent.chat"]})
        self.api._run_agent("hrms_setup", "start", None)
        self.frappe.get_attr.assert_called_with("reckon_hrms.ai_agent.chat")

    def test_the_state_comes_back_as_text_from_the_page_and_is_parsed(self):
        self.api._run_agent("hrms_setup", "India", '{"idx": 0, "answers": {}}')
        self.assertEqual(self.calls[-1], ("India", {"idx": 0, "answers": {}}))
        self.api._run_agent("hrms_setup", "x", "not json")
        self.assertIsNone(self.calls[-1][1])

    def test_a_name_no_app_registered_is_refused(self):
        with self.assertRaises(support.Boom):
            self.api._run_agent("delete_everything", "hi", None)
        self.frappe.get_attr.assert_not_called()

    def test_a_finished_agent_hands_the_chat_back(self):
        self.frappe.get_attr = Mock(return_value=lambda m, s: {"reply": "Done.", "state": None, "replies": [], "done": True})
        out = self.api._run_agent("hrms_setup", "yes", {})
        self.assertIsNone(out["agent"])
        self.assertIsNone(out["agent_state"])

    def test_a_bad_reply_from_an_agent_is_an_error(self):
        self.frappe.get_attr = Mock(return_value=lambda m, s: "not a dict")
        with self.assertRaises(support.Boom):
            self.api._run_agent("hrms_setup", "x", None)

    def test_ask_sends_agent_turns_to_the_agent_without_using_the_ai_or_its_daily_quota(self):
        with patch.object(self.api, "_require_desk_user"), patch.object(self.api, "_settings", return_value=Mock(enable_ai_bar=1)), \
                patch.object(self.api, "_complete") as complete, patch.object(self.api, "_consume_daily_ask_quota") as quota:
            out = self.api.ask("start", route="x", agent="hrms_setup", agent_state=None)
        self.assertEqual(out["agent"], "hrms_setup")
        complete.assert_not_called()
        quota.assert_not_called()


class IntentTests(unittest.TestCase):
    def setUp(self):
        self.api, self.frappe, _cache = support.load_api()

    def hooks(self, mapping):
        self.frappe.get_hooks = Mock(side_effect=lambda name: mapping.get(name) or {})

    def test_a_plain_question_that_is_a_request_for_an_agent_starts_it(self):
        self.hooks({"aura_agent_intents": {"hrms_setup": ["reckon_hrms.ai_agent.intent"]}})
        self.frappe.get_attr = Mock(return_value=lambda q, route: "start industry")
        self.assertEqual(self.api._agent_for_question("Which industry should I choose?", "reckon-hrms/x"), ("hrms_setup", "start industry"))

    def test_other_questions_get_the_normal_answer_and_a_failing_intent_never_blocks_it(self):
        self.hooks({"aura_agent_intents": {"hrms_setup": ["reckon_hrms.ai_agent.intent"]}})
        self.frappe.get_attr = Mock(return_value=lambda q, route: None)
        self.assertIsNone(self.api._agent_for_question("What is a salary slip?", "x"))
        self.frappe.get_attr = Mock(side_effect=ImportError("app not installed"))
        self.assertIsNone(self.api._agent_for_question("anything", "x"))
        self.hooks({})
        self.assertIsNone(self.api._agent_for_question("anything", "x"))

    def test_ask_starts_the_agent_for_such_a_question_without_the_ai(self):
        self.hooks({"aura_agents": {"hrms_setup": ["reckon_hrms.ai_agent.chat"]}, "aura_agent_intents": {"hrms_setup": ["reckon_hrms.ai_agent.intent"]}})
        calls = []

        def get_attr(path):
            if path.endswith("intent"):
                return lambda q, route: "start industry"
            return lambda message, state: calls.append(message) or {"reply": "What does your company do?", "state": {"idx": 3}, "replies": ["skip"], "done": False}

        self.frappe.get_attr = Mock(side_effect=get_attr)
        with patch.object(self.api, "_require_desk_user"), patch.object(self.api, "_settings", return_value=Mock(enable_ai_bar=1)),                 patch.object(self.api, "_complete") as complete:
            out = self.api.ask("Which industry should I choose for my company?", route="reckon-hrms/hr")
        self.assertEqual((out["agent"], out["answer"], calls), ("hrms_setup", "What does your company do?", ["start industry"]))
        complete.assert_not_called()


class ChoiceTests(unittest.TestCase):
    def setUp(self):
        self.api, self.frappe, _cache = support.load_api()

    def test_radio_and_checkbox_choices_pass_through_cleaned(self):
        out = self.api._clean_choices({"type": "multi", "options": [{"label": "Friday", "value": "Friday", "checked": 1}, {"label": "Saturday"}, "junk", {"nolabel": 1}]})
        self.assertEqual(out["type"], "multi")
        self.assertEqual(out["options"], [{"label": "Friday", "value": "Friday", "checked": True}, {"label": "Saturday", "value": "Saturday", "checked": False}])

    def test_anything_else_is_dropped(self):
        for bad in (None, "x", {"type": "dropdown", "options": [{"label": "a"}]}, {"type": "single", "options": []}, {"type": "single", "options": ["a"]}):
            self.assertIsNone(self.api._clean_choices(bad))

    def test_the_options_are_capped(self):
        out = self.api._clean_choices({"type": "single", "options": [{"label": str(i)} for i in range(40)]})
        self.assertEqual(len(out["options"]), 14)


class ButtonTests(unittest.TestCase):
    def test_choice_and_quick_reply_buttons_are_not_the_welcome_chips(self):
        """A global handler sends the text of every `.aura-chip`: the Continue button sent the word "Continue" for the answer."""
        text = JS.read_text(encoding="utf-8")
        start = text.index("aura.render_choices = function")
        end = text.index("aura.submit_ask = function")
        block = text[start:end]
        import re

        self.assertIsNone(re.search(r'class="[^"]*aura-chip', block))  # `aura-chips` (the row) is fine: the handler is on `.aura-chip`
        self.assertIn('class="aura-choice-go"', block)
        self.assertIn('class="aura-qr"', block)


class RateLimitTests(unittest.TestCase):
    def test_agent_turns_have_their_own_high_limit_so_an_interview_cannot_use_up_the_ai_questions(self):
        import re

        text = (Path(__file__).resolve().parents[1] / "reckon_aura_theme" / "api.py").read_text(encoding="utf-8")
        agent_limit = int(re.search(r"rate_limit\(limit=(\d+)[^)]*\)\s+def ask_agent", text).group(1))
        ask_limit = int(re.search(r"rate_limit\(limit=(\d+)[^)]*\)\s+def ask\(", text).group(1))
        self.assertGreaterEqual(agent_limit, 300)
        self.assertEqual(ask_limit, 40)
        self.assertIn('agent ? "reckon_aura_theme.api.ask_agent"', JS.read_text(encoding="utf-8"))

    def test_ask_agent_runs_the_agent_and_needs_one(self):
        api, frappe, _c = support.load_api()
        frappe.get_hooks = Mock(return_value={"hrms_setup": ["reckon_hrms.ai_agent.chat"]})
        frappe.get_attr = Mock(return_value=lambda m, s: {"reply": "Hi", "state": {"idx": 0}, "replies": [], "done": False})
        with patch.object(api, "_require_desk_user"), patch.object(api, "_settings", return_value=Mock(enable_ai_bar=1)):
            out = api.ask_agent("start", agent="hrms_setup")
            self.assertEqual(out["answer"], "Hi")
            with self.assertRaises(support.Boom):
                api.ask_agent("start", agent="")


class TimeoutTests(unittest.TestCase):
    def test_a_caller_can_cap_how_long_the_ai_may_take(self):
        api, frappe, _c = support.load_api()
        calls = []

        def post(url, headers, payload, timeout=60):
            calls.append(timeout)
            return {"choices": [{"message": {"content": "ok"}}]}

        settings = Mock(ai_provider="OpenAI Compatible", ai_base_url="http://x", ai_model="m")
        with patch.object(api, "_api_key", return_value="k"), patch.object(api, "_post", side_effect=post):
            api._complete(settings, "s", "u", timeout=12)
            api._complete(settings, "s", "u")
        self.assertEqual(calls, [12, 60])


class PageTests(unittest.TestCase):
    def test_the_chat_can_start_an_agent_and_shows_quick_replies(self):
        text = JS.read_text(encoding="utf-8")
        for needle in ("aura.start_agent", "aura.agent_state", "render_quick_replies", "agent_state: agent ?", "hasOwnProperty.call(r, \"agent\")", "render_choices", 'type="${multi ? "checkbox" : "radio"}"'):
            self.assertIn(needle, text)


if __name__ == "__main__":
    unittest.main()
