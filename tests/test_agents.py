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


class PageTests(unittest.TestCase):
    def test_the_chat_can_start_an_agent_and_shows_quick_replies(self):
        text = JS.read_text(encoding="utf-8")
        for needle in ("aura.start_agent", "aura.agent_state", "render_quick_replies", "agent_state: agent ?"):
            self.assertIn(needle, text)


if __name__ == "__main__":
    unittest.main()
