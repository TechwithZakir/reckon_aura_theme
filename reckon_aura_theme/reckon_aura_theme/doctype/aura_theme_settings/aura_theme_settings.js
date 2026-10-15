// Copyright (c) 2026, TechwithZakir and contributors
// For license information, please see license.txt

frappe.ui.form.on("Aura Theme Settings", {
	refresh(frm) {
		frm.add_custom_button(__("Test AI connection"), () => {
			frappe.call({
				method: "reckon_aura_theme.api.test_connection",
				freeze: true,
				freeze_message: __("Talking to your AI provider…"),
				callback: (r) => r.message && frappe.msgprint({
					title: __("AI connection works"),
					message: frappe.utils.escape_html(r.message),
					indicator: "green",
				}),
			});
		});
		frm.add_custom_button(__("Reset my toolbar choices"), () => {
			localStorage.removeItem("aura:prefs");
			frappe.show_alert({ message: __("Accent and density reset to site defaults"), indicator: "green" });
			window.aura && aura.apply();
		});
	},
	after_save() {
		frappe.show_alert({ message: __("Theme updated — reloading"), indicator: "green" });
		setTimeout(() => window.location.reload(), 600);
	},
});
