function displayFields(form, customHTML) {		
	form.setValue("atividade", getValue('WKNumState'));
	form.setValue("formMode", form.getFormMode());
	form.setValue("userCode", getValue("WKUser"));
	if (getValue('WKNumState') == 0 || getValue('WKNumState') == 4) {
		form.setValue("solicitante", getValue("WKUser"));

		if (getValue("WKUser") == 'alysson.silva1') {
			form.setValue("solicitante", "alysson.silva");
		}
	}
	else if(getValue('WKNumState') == 5){
		form.setValue("atendimento", getValue("WKUser"));
	}
}