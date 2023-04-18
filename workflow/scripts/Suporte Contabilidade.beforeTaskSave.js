function beforeTaskSave(colleagueId,nextSequenceId,userList){
    var atividade = getValue('WKNumState');
    var decisao = hAPI.getCardValue("decisao");
    var formMode = hAPI.getCardValue("formMode");
    hAPI.setCardValue("numProces", getValue("WKNumProces"));

    if (nextSequenceId != atividade) {
        if (formMode == "ADD") {
            hAPI.setTaskComments(colleagueId, getValue("WKNumProces"), 0, hAPI.getCardValue("problema"));

			if (hAPI.getCardValue("categoria") == "Entrada de Equipamentos") {
				var docsNF = hAPI.getCardValue("idDocNFRemessa").split(",");
				for (var i = 0; i < docsNF.length; i++) {
					AnexarDocumento(docsNF[i]);
				}
			}
			else if(hAPI.getCardValue("categoria") == "Devolução de Equipamentos"){
				var docsNF = hAPI.getCardValue("idDocNFOrigem").split(",");
				for (var i = 0; i < docsNF.length; i++) {
					AnexarDocumento(docsNF[i]);
				}
			}
			else if(hAPI.getCardValue("categoria") == "Devolução de Compras"){
				var docs = hAPI.getCardValue("idDocNFDevCompras").split(",");
				for (var i = 0; i < docs.length; i++) {
					AnexarDocumento(docs[i]);
				}
			}
        }
        else if(atividade == 4){
            hAPI.setTaskComments(colleagueId, getValue("WKNumProces"), 0, hAPI.getCardValue("observacao"));
            EnviaNotificacaoAtualizacao(getValue("WKNumProces"));
        }
        else if (atividade == 5) {
            if (decisao == "Retornar") {
                hAPI.setTaskComments(colleagueId, getValue("WKNumProces"), 0, hAPI.getCardValue("observacao"));
                EnviaNotificacaoAtualizacao(getValue("WKNumProces"));
            }else{
				var docsResolucao = hAPI.getCardValue("idDocAnexoResolucao");
				if (docsResolucao != null && docsResolucao != "") {
					docsResolucao = docsResolucao.split(",");
					for (var i = 0; i < docsResolucao.length; i++) {
						AnexarDocumento(docsResolucao[i]);
					}					
				}

                hAPI.setTaskComments(colleagueId, getValue("WKNumProces"), 0, "<b>Resolução: </b>" + hAPI.getCardValue("solucao"));
				EnviaNotificacaoEncerramento(getValue("WKNumProces"));
            }
        }
    }
}

function EnviaNotificacaoEncerramento(numSolic){
	log.info("envia email");
	try {
		var url = 'http://fluig.castilho.com.br:1010';//Prod
		//var url = 'http://homologacao.castilho.com.br:2020';//Homolog

		var html = 
		"<p>\
			Segue a resolução referente a solicitação\
			<a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.\
		</p>\
		<div>\
			<p>\
				<b>Data:</b> " + hAPI.getCardValue('data_ocorrencia') + "</br>\
				<b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
				<b>Categoria:</b> " +  hAPI.getCardValue('categoria') + "</br>";

				if (hAPI.getCardValue("categoria") == "Exclusão de Lançamento") {
					var json = JSON.parse(hAPI.getCardValue("jsonMovimentoExclusao"));

					html +=
					"<br>\
					<b>Coligada: </b>" + json.CODCOLIGADA + " - " + json.COLIGADA + "<br>\
					<b>Filial: </b>" + json.CODFILIAL + " - " + json.FILIAL + "<br>\
					<b>Movimento: </b>" + json.IDMOV + "<br>\
					<b>Fornecedor: </b>" + json.FORNECEDOR + "<br>\
					<b>CPF/CNPJ: </b>" + json.CGCCFO + "<br>\
					<b>Tipo do Movimento: </b>" + json.CODTMV + "<br>\
					<b>Valor: </b>" + json.VALOR + "<br>\
					<b>Data de Emissão: </b>" + FormataDataParaDD_MM_AAAA(json.DATAEMISSAO) + "<br><br>";

					if (hAPI.getCardValue("checkboxCancelarMovOrigem") == "on") {
						var jsonMovOrigem = JSON.parse(hAPI.getCardValue("jsonMovimentoOrigemExclusao"));

						html+= 
						"<b>Coligada: </b>" + jsonMovOrigem.CODCOLIGADA + " - " + jsonMovOrigem.COLIGADA + "<br>\
						<b>Filial: </b>" + jsonMovOrigem.CODFILIAL + " - " + jsonMovOrigem.FILIAL + "<br>\
						<b>Movimento: </b>" + jsonMovOrigem.IDMOV + "<br>\
						<b>Fornecedor: </b>" + jsonMovOrigem.FORNECEDOR + "<br>\
						<b>CPF/CNPJ: </b>" + jsonMovOrigem.CGCCFO + "<br>\
						<b>Tipo do Movimento: </b>" + jsonMovOrigem.CODTMV + "<br>\
						<b>Valor: </b>" + jsonMovOrigem.VALOR + "<br>\
						<b>Data de Emissão: </b>" + FormataDataParaDD_MM_AAAA(jsonMovOrigem.DATAEMISSAO) + "<br><br>";
					}
				}
				else if(hAPI.getCardValue("categoria") == "Entrada de Equipamentos"){
					var codigoContrato = hAPI.getCardValue("NContratoEntradaDeEquipamentos");
					if (codigoContrato != "") {
						var contrato = DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
							DatasetFactory.createConstraint("operacao", "BuscaContrato", "BuscaContrato", ConstraintType.MUST),
							DatasetFactory.createConstraint("codigocontrato", codigoContrato, codigoContrato, ConstraintType.MUST)
						], null);
						html+=
						"<br>\
						<b>Contrato: </b><span>" + codigoContrato + " - " + contrato.getValue(0, "NOME") + "</span><br>\
						<b>Fornecedor: </b><span>" + contrato.getValue(0, "CNPJ") + " - " + contrato.getValue(0, "FORNECEDOR") + "</span><br>\
						<b>Tipo: </b><span>" + contrato.getValue(0, "TIPO") + "</span><br>\
						<b>Status: </b><span>" + contrato.getValue(0, "STATUS") + "</span><br><br>";
					}

					html += "<b>Equipamentos: </b><br><span>" + hAPI.getCardValue("EqpEntradaDeEquipamentos").split("\n").join("<br>") + "</span><br><br>";
				}
				else if(hAPI.getCardValue("categoria") == "Devolução de Equipamentos"){
					html +=
					"<br>\
					<b>Obra: </b><span>" + hAPI.getCardValue("ObraDevolucaoDeEquipamentos") + "</span><br>\
					<b>Devolução: </b><span>" + hAPI.getCardValue("selectEqpDevolucaoDeEqp") + "</span><br>";

					if (hAPI.getCardValue("selectEqpDevolucaoDeEqp") == "Parcial") {
						html += "<b>Equipamentos: </b><span>" + hAPI.getCardValue("descEqpDevolucaoDeEqp") + "</span><br>";
					}

					html +=
					"<b>Data de Entrada: </b><span>" + hAPI.getCardValue("dataEntradaDevolucaoDeEqp") + "</span><br>\
					<b>Data de Retirada: </b><span>" + hAPI.getCardValue("dataRetiradaDevolucaoDeEqp") + "</span><br>\
					<b>Responsável pelo frete: </b><span>" + hAPI.getCardValue("selectFreteDevolucaoDeEqp") + "</span><br>";
					if ((hAPI.getCardValue("selectTransporteDevolucaoDeEqp") == "Terceiro" && hAPI.getCardValue("selectFreteDevolucaoDeEqp") != "Sem Frete") || hAPI.getCardValue("selectFreteDevolucaoDeEqp") == "Próprio Remetente") {
						html +=
						"<b>Transportadora: </b><span>" + hAPI.getCardValue("CNPJTranspDevolucaoDeEqp") + "</span><br>\
						<b>Placa: </b><span>" + hAPI.getCardValue("inputPlacaDevolucaoDeEqp") + "</span><br>"
					}
				}
				else if(hAPI.getCardValue("categoria") == "Devolução de Compras"){
					var ds = DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
						DatasetFactory.createConstraint("operacao", "BuscaMovimento", "BuscaMovimentos", ConstraintType.MUST),
						DatasetFactory.createConstraint("codcoligada", hAPI.getCardValue("coligadaDevolucaoDeCompra"), hAPI.getCardValue("coligadaDevolucaoDeCompra"), ConstraintType.MUST),
						DatasetFactory.createConstraint("idmov",  hAPI.getCardValue("movimentoDevolucaoDeCompra"), hAPI.getCardValue("movimentoDevolucaoDeCompra"), ConstraintType.MUST)
					], null);


					var itens = JSON.parse(hAPI.getCardValue("jsonItensDevolucaoCompras"));
					html +=
					"<b>Obra: </b><span>" + hAPI.getCardValue("ObraDevolucaoDeCompra") + "</span><br>\
					<b>Fornecedor: </b><span>" + ds.getValue(0, "CGCCFO") + " - " + ds.getValue(0, "FORNECEDOR") + "</span><br>\
					<b>Motivo: </b><br><span>" + hAPI.getCardValue("MotivoDevolucaoDeCompra").split("\n").join("<br>") + "</span><br><br>\
					<b>Acordo do pagamento:: </b><br><span>" + hAPI.getCardValue("inputAcordoDevolucaoDeCompra").split("\n").join("<br>") + "</span><br><br>\
					<br>";

					for (var i = 0; i < itens.length; i++) {
						html+=
						"<b>Item " + (i+1) + "</b><br>\
						<b>Descrição: </b><span>" + itens[i].descricao + "</span><br>\
						<b>Valor Unitário: </b><span>" + itens[i].valorUnit + "</span><br>\
						<b>Quantidade Devolvida: </b><span>" + itens[i].qntDevolvida + "</span><br>\
						<b>Valor Devolvido: </b><span>R$ " + parseFloat(itens[i].valorUnit.trim().split("R$")[1].split(".").join("").replace(",", ".") * itens[i].qntDevolvida.split(" ")[0]).toFixed(2) + "</span><br><br>";
					}
					
					html += 
					"<b>Forma de Transporte: </b><span>" + hAPI.getCardValue("selectTranspDevolucaoDeCompra") + "</span><br>\
					<b>Responsável pelo Frete: </b><span>" + hAPI.getCardValue("selectFreteDevolucaoDeCompra") + "</span><br>";
					if ((hAPI.getCardValue("selectTranspDevolucaoDeCompra") == "Terceiro" && hAPI.getCardValue("selectFreteDevolucaoDeCompra") != "Sem Frete") || hAPI.getCardValue("selectFreteDevolucaoDeCompra") == "Próprio Remetente") {
						html +=
						"<b>Transportadora: </b><span>" + hAPI.getCardValue("CNPJTranspDevolucaoDeCompra") + "</span><br>\
						<b>Placa: </b><span>" + hAPI.getCardValue("inputPlacaDevolucaoDeCompra") + "</span><br>"
					}
					html+="<br>";
				}
				else if(hAPI.getCardValue("categoria") == "Transferencia de Imobilizado"){
					var ItensImobilizado =  hAPI.getCardValue("jsonItensImobilizado");
					ItensImobilizado = JSON.parse(ItensImobilizado);

					html+=
					"<br>\
					<b>Endereço de Origem: </b><span>" + hAPI.getCardValue("EndOrImobilizado") + "</span><br>\
					<b>Endereço de Destino: </b><span>" + hAPI.getCardValue("EndDesImobilizado") + "</span><br>\
					<b>Quantidade de Itens: </b><span>" + ItensImobilizado.length + "</span><br>\
					<b>Data da Saída: </b><span>" + hAPI.getCardValue("data_saida_equipamento") + "</span><br><br>";
				}

				html+=
				"<b>Chamado:</b><br>" +  hAPI.getCardValue('problema').split("\n").join("<br>") + "</br></br>\
				<b>Responsável:</b> " + getValue("WKUser") +"</br>\
				<b>Solução:</b><br>" + hAPI.getCardValue('solucao').split("\n").join("<br>") + "\
			</p>\
		</div>";

	    var anexos = BuscaAnexos();
        if (anexos != false && anexos != "") {
            html += 
            "<div>\
				<p>\
					<b>Anexos:</b>\
					<ul>\
            			" + anexos + "<br>\
					</ul>\
				</p>\
			</div>";
        }

		html += "<div>\
			<p> Para mais detalhes, <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>clique aqui.</a></p>\
		</div>";
		log.info("Remetentes: " + BuscaRemetentes());

        var data = {                                                   
            companyId : getValue("WKCompany").toString(),
            serviceCode : 'ServicoFluig',                     
            endpoint : '/api/public/alert/customEmailSender',  
            method : 'post',                              
            timeoutService: '100',
            params:{
                to: BuscaRemetentes(),
                //from: "fluig@construtoracastilho.com.br", //Prod
                from: "no-reply@construtoracastilho.com.br", //Homolog
                subject: "[FLUIG] Chamado Encerrado - Suporte Contabilidade - " + hAPI.getCardValue("categoria"),
                templateId: "TPL_SUPORTE_TI2",
                dialectId: "pt_BR",
                param: {
					"CORPO_EMAIL": html,
					"SERVER_URL": url,
					"TENANT_ID": "1"
				}
            }
        }

		var clientService = fluigAPI.getAuthorizeClientService();
        var vo = clientService.invoke(JSONUtil.toJSON(data));
		if(vo.getResult() == null || vo.getResult().isEmpty()){
            throw "Retorno está vazio";
        }else{
			log.info("voResult");
            log.info(vo.getResult());
        }
		log.info("Fim envia email");
	} catch (error) {
		throw "Erro ao enviar e-mail de notificação: " + error;
	}
}

function EnviaNotificacaoAtualizacao(numSolic){
	log.info("envia email");
	try {
		var url = 'http://fluig.castilho.com.br:1010';//Prod
		//var url = 'http://homologacao.castilho.com.br:2020';//Homolog

        var atualizacao = null;
		var mensagem = null;
        if (hAPI.getCardValue("atividade") == "5") {
            atualizacao = "<b>Observação:</b><br>" + hAPI.getCardValue("observacao");
			mensagem = "Segue o retorno referente a solicitação Nº" + numSolic + ", \
			favor <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>acessar a solicitação</a> e dar <b>continuidade ao seu chamado</b>.<br>\
			Ele será <b style='color:red;'>encerrado automaticamente</b> em <b style='color:red;'>" + hAPI.getCardValue("data_prazo_retorno") + "</b> caso não seja movimentado.";
        }
        else{
            atualizacao = "<b>Observação:</b><br>" + hAPI.getCardValue("observacao");
			mensagem = "Segue a atualização referente a solicitação\
			<a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>Nº" + numSolic + "</a>.";
        }

		var html = 
		"<p class='DescrMsgForum'>\
			" + mensagem + "\
		</p>\
		<div class='DescrMsgForum actions'>\
			<p class='DescrMsgForum'>\
				<b>Data:</b> " + hAPI.getCardValue('data_ocorrencia') + "</br>\
				<b>Usuário:</b> " + hAPI.getCardValue('usuario') + "</br>\
				<b>Categoria:</b> " +  hAPI.getCardValue('categoria') + "</br>";

				if (hAPI.getCardValue("categoria") == "Exclusão de Lançamento") {
					var json = JSON.parse(hAPI.getCardValue("jsonMovimentoExclusao"));

					html +=
					"<br>\
					<b>Coligada: </b>" + json.CODCOLIGADA + " - " + json.COLIGADA + "<br>\
					<b>Filial: </b>" + json.CODFILIAL + " - " + json.FILIAL + "<br>\
					<b>Movimento: </b>" + json.IDMOV + "<br>\
					<b>Fornecedor: </b>" + json.FORNECEDOR + "<br>\
					<b>CPF/CNPJ: </b>" + json.CGCCFO + "<br>\
					<b>Tipo do Movimento: </b>" + json.CODTMV + "<br>\
					<b>Valor: </b>" + json.VALOR + "<br>\
					<b>Data de Emissão: </b>" + FormataDataParaDD_MM_AAAA(json.DATAEMISSAO) + "<br><br>";

					if (hAPI.getCardValue("checkboxCancelarMovOrigem") == "on") {
						var jsonMovOrigem = JSON.parse(hAPI.getCardValue("jsonMovimentoOrigemExclusao"));

						html+= 
						"<b>Coligada: </b>" + jsonMovOrigem.CODCOLIGADA + " - " + jsonMovOrigem.COLIGADA + "<br>\
						<b>Filial: </b>" + jsonMovOrigem.CODFILIAL + " - " + jsonMovOrigem.FILIAL + "<br>\
						<b>Movimento: </b>" + jsonMovOrigem.IDMOV + "<br>\
						<b>Fornecedor: </b>" + jsonMovOrigem.FORNECEDOR + "<br>\
						<b>CPF/CNPJ: </b>" + jsonMovOrigem.CGCCFO + "<br>\
						<b>Tipo do Movimento: </b>" + jsonMovOrigem.CODTMV + "<br>\
						<b>Valor: </b>" + jsonMovOrigem.VALOR + "<br>\
						<b>Data de Emissão: </b>" + FormataDataParaDD_MM_AAAA(jsonMovOrigem.DATAEMISSAO) + "<br><br>";
					}
				}
				else if(hAPI.getCardValue("categoria") == "Entrada de Equipamentos"){
					var codigoContrato = hAPI.getCardValue("NContratoEntradaDeEquipamentos");
					if (codigoContrato != "") {
						var contrato = DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
							DatasetFactory.createConstraint("operacao", "BuscaContrato", "BuscaContrato", ConstraintType.MUST),
							DatasetFactory.createConstraint("codigocontrato", codigoContrato, codigoContrato, ConstraintType.MUST)
						], null);
						html+=
						"<br>\
						<b>Contrato: </b><span>" + codigoContrato + " - " + contrato.getValue(0, "NOME") + "</span><br>\
						<b>Fornecedor: </b><span>" + contrato.getValue(0, "CNPJ") + " - " + contrato.getValue(0, "FORNECEDOR") + "</span><br>\
						<b>Tipo: </b><span>" + contrato.getValue(0, "TIPO") + "</span><br>\
						<b>Status: </b><span>" + contrato.getValue(0, "STATUS") + "</span><br><br>";
					}

					html += "<b>Equipamentos: </b><br><span>" + hAPI.getCardValue("EqpEntradaDeEquipamentos").split("\n").join("<br>") + "</span><br><br>";
				}
				else if(hAPI.getCardValue("categoria") == "Devolução de Equipamentos"){
					html +=
					"<br>\
					<b>Obra: </b><span>" + hAPI.getCardValue("ObraDevolucaoDeEquipamentos") + "</span><br>\
					<b>Devolução: </b><span>" + hAPI.getCardValue("selectEqpDevolucaoDeEqp") + "</span><br\
					<b>Data de Entrada: </b><span>" + hAPI.getCardValue("dataEntradaDevolucaoDeEqp") + "</span><br>\
					<b>Data de Retirada: </b><span>" + hAPI.getCardValue("dataRetiradaDevolucaoDeEqp") + "</span><br>";
					if (hAPI.getCardValue("selectEqpDevolucaoDeEqp") == "Parcial") {
						html += "<b>Equipamentos: </b><br><span>" + hAPI.getCardValue("descEqpDevolucaoDeEqp").split("\n").join("<br>") + "</span><br><br>";
					}

					html+= 
					"<b>Responsável pelo frete: </b><span>" + hAPI.getCardValue("selectFreteDevolucaoDeEqp") + "</span><br>";
					if ((hAPI.getCardValue("selectTransporteDevolucaoDeEqp") == "Terceiro" && hAPI.getCardValue("selectFreteDevolucaoDeEqp") != "Sem Frete") || hAPI.getCardValue("selectFreteDevolucaoDeEqp") == "Próprio Remetente") {
						html +=
						"<b>Transportadora: </b><span>" + hAPI.getCardValue("CNPJTranspDevolucaoDeEqp") + "</span><br>\
						<b>Placa: </b><span>" + hAPI.getCardValue("inputPlacaDevolucaoDeEqp") + "</span><br>"
					}
				}
				else if(hAPI.getCardValue("categoria") == "Devolução de Compras"){
					var ds = DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
						DatasetFactory.createConstraint("operacao", "BuscaMovimento", "BuscaMovimentos", ConstraintType.MUST),
						DatasetFactory.createConstraint("codcoligada", hAPI.getCardValue("coligadaDevolucaoDeCompra"), hAPI.getCardValue("coligadaDevolucaoDeCompra"), ConstraintType.MUST),
						DatasetFactory.createConstraint("idmov",  hAPI.getCardValue("movimentoDevolucaoDeCompra"), hAPI.getCardValue("movimentoDevolucaoDeCompra"), ConstraintType.MUST)
					], null);


					var itens = JSON.parse(hAPI.getCardValue("jsonItensDevolucaoCompras"));
					html +=
					"<b>Obra: </b><span>" + hAPI.getCardValue("ObraDevolucaoDeCompra") + "</span><br>\
					<b>Fornecedor: </b><span>" + ds.getValue(0, "CGCCFO") + " - " + ds.getValue(0, "FORNECEDOR") + "</span><br>\
					<b>Motivo: </b><br><span>" + hAPI.getCardValue("MotivoDevolucaoDeCompra").split("\n").join("<br>") + "</span><br><br>\
					<b>Acordo do pagamento:: </b><br><span>" + hAPI.getCardValue("inputAcordoDevolucaoDeCompra").split("\n").join("<br>") + "</span><br><br>\
					<br>";

					for (var i = 0; i < itens.length; i++) {
						html+=
						"<b>Item " + (i+1) + "</b><br>\
						<b>Descrição: </b><span>" + itens[i].descricao + "</span><br>\
						<b>Valor Unitário: </b><span>" + itens[i].valorUnit + "</span><br>\
						<b>Quantidade Devolvida: </b><span>" + itens[i].qntDevolvida + "</span><br>\
						<b>Valor Devolvido: </b><span>R$ " + parseFloat(itens[i].valorUnit.trim().split("R$")[1].split(".").join("").replace(",", ".") * itens[i].qntDevolvida.split(" ")[0]).toFixed(2) + "</span><br><br>";
					}
					
					html += 
					"<b>Forma de Transporte: </b><span>" + hAPI.getCardValue("selectTranspDevolucaoDeCompra") + "</span><br>\
					<b>Responsável pelo Frete: </b><span>" + hAPI.getCardValue("selectFreteDevolucaoDeCompra") + "</span><br>";
					if ((hAPI.getCardValue("selectTranspDevolucaoDeCompra") == "Terceiro" && hAPI.getCardValue("selectFreteDevolucaoDeCompra") != "Sem Frete") || hAPI.getCardValue("selectFreteDevolucaoDeCompra") == "Próprio Remetente") {
						html +=
						"<b>Transportadora: </b><span>" + hAPI.getCardValue("CNPJTranspDevolucaoDeCompra") + "</span><br>\
						<b>Placa: </b><span>" + hAPI.getCardValue("inputPlacaDevolucaoDeCompra") + "</span><br>"
					}
					html+="<br>";
				}
				else if(hAPI.getCardValue("categoria") == "Transferencia de Imobilizado"){
					var ItensImobilizado =  hAPI.getCardValue("jsonItensImobilizado");
					ItensImobilizado = JSON.parse(ItensImobilizado);
					html+=
					"<br>\
					<b>Endereço de Origem: </b><span>" + hAPI.getCardValue("EndOrImobilizado") + "</span><br>\
					<b>Endereço de Destino: </b><span>" + hAPI.getCardValue("EndDesImobilizado") + "</span><br>\
					<b>Quantidade de Itens: </b><span>" + ItensImobilizado.length + "</span><br>\
					<b>Data da Saída: </b><span>" + hAPI.getCardValue("data_saida_equipamento") + "</span><br><br>";
				}
				html +="<b>Chamado:</b><br>" +  hAPI.getCardValue('problema').split("\n").join("<br>") + "</br></br>\
				<b>Responsável:</b> " + getValue("WKUser") +"</br>\
				" + atualizacao.split("\n").join("<br>") + "\
			</p>\
		</div>\
        <br>";
            var anexos = BuscaAnexos();
            if (anexos != false && anexos != "") {
                html += 
                "<div class='DescrMsgForum'>\
					<p class='DescrMsgForum'>\
						<b>Anexos:</b>\
						<ul>\
                			" + anexos + "<br>\
						</ul>\
					</p>\
				</div>";
            }

		html += "<div class='DescrMsgForum actions'>\
			<br />\
			<p class='DescrMsgForum'> Para mais detalhes, <a href='" + url + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numSolic + "' target='_blank'>clique aqui.</a></p>\
		</div>";

        var data = {                                                   
            companyId : getValue("WKCompany").toString(),
            serviceCode : 'ServicoFluig',                     
            endpoint : '/api/public/alert/customEmailSender',  
            method : 'post',                              
            timeoutService: '100',
            params:{
                to: BuscaRemetentes(),
                //from: "fluig@construtoracastilho.com.br", //Prod
                from: "no-reply@construtoracastilho.com.br", //Homolog
                subject: "[FLUIG] Atualização - Suporte Contabilidade - " + hAPI.getCardValue("categoria"),
                templateId: "TPL_SUPORTE_TI2",
                dialectId: "pt_BR",
                param: {
					"CORPO_EMAIL": html,
					"SERVER_URL": url,
					"TENANT_ID": "1"
				}
            }
        }

		var clientService = fluigAPI.getAuthorizeClientService();
        var vo = clientService.invoke(JSONUtil.toJSON(data));

		if(vo.getResult() == null || vo.getResult().isEmpty()){
            throw "Retorno está vazio";
        }else{
            log.info(vo.getResult());
        }
		log.info("Fim envia email");
	} catch (error) {
		throw "Erro ao enviar e-mail de notificação: " + error;
	}
}

function BuscaEmailUsuario(usuario) {
    var ds = DatasetFactory.getDataset("colleague", null, [DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)], null);
	if (ds.values.length > 0) {
		return ds.getValue(0, "mail") + "; ";
	}
	else{
		return "";
	}
}

function BuscaAnexos(){
    var retorno = "";
    var docs = hAPI.listAttachments();

    for (var i = 0; i < docs.size(); i++) {
        var doc = docs.get(i);
            retorno += "<li><a href='" + fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()) + "'>" + doc.getDocumentDescription() + "</a></li>"
    }

    return retorno;
}

function BuscaRemetentes(){
	var usuario = hAPI.getCardValue('usuario');
	var solicitante = hAPI.getCardValue('solicitante');
	var emailsCopia = hAPI.getCardValue("email");
	var listRemetentes = "gabriel.persike@castilho.com.br; ";//Homolog
	//var listRemetentes = "suporte.contabilidade@castilho.com.br; gabriel.persike@castilho.com.br; ";//Prod


	if (hAPI.getCardValue("checkboxEncaminhaFinan") == "on" && hAPI.getCardValue("decisao") == "Enviar" && hAPI.getCardValue("atividade") == 5) {
		listRemetentes+= "financeiro@castilho.com.br; ";
	}


	//Caso o solicitante não seja do grupo SuporteContabilidade inclui o e-mail na lista de remetentes
	var ds = DatasetFactory.getDataset("colleagueGroup", null, [
		DatasetFactory.createConstraint("colleagueId", solicitante, solicitante, ConstraintType.MUST),
		DatasetFactory.createConstraint("groupId", "SuporteContabilidade", "SuporteContabilidade", ConstraintType.MUST)
	], null);
	if (ds.values.length < 1) {
		listRemetentes += BuscaEmailUsuario(solicitante);
	}

	//Caso o usuario não seja do grupo SuporteContabilidade e caso o usuario não seja o solicitante inclui o e-mail na lista de remetentes
	if (usuario != solicitante) {
		var ds = DatasetFactory.getDataset("colleagueGroup", null, [
			DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST),
			DatasetFactory.createConstraint("groupId", "SuporteContabilidade", "SuporteContabilidade", ConstraintType.MUST)
		], null);
		if (ds.values.length < 1) {
			listRemetentes += BuscaEmailUsuario(usuario);
		}
	}

	if (emailsCopia != null && emailsCopia != "" && emailsCopia != undefined) {
		listRemetentes += emailsCopia;
	}

	if(listRemetentes.substring(listRemetentes.length - 2, listRemetentes.length) == "; "){
		listRemetentes = listRemetentes.substring(0, listRemetentes.length - 2);
	}
	
	if(listRemetentes.substring(listRemetentes.length - 1, listRemetentes.length) == ";" || listRemetentes.substring(listRemetentes.length - 1, listRemetentes.length) == " "){
		listRemetentes = listRemetentes.substring(0, listRemetentes.length - 1);
	}

	log.info("ListRemetentes: " + listRemetentes);
    return listRemetentes;
}

function FormataDataParaDD_MM_AAAA(data) {
    data = data.split(" ")[0].split("-");
    return data[2] + "/" + data[1] + "/" + data[0];
}

function AnexarDocumento(id) {
    var attachments = hAPI.listAttachments();
    var isAnexado = false;

    for (var i = 0; i < attachments.size(); i++) {
        if (id == attachments.get(i).getDocumentId()) {
            isAnexado = true;
        }
    }

    if (!isAnexado) {
        hAPI.attachDocument(id);
    }
}

function BuscaTransportadora(CNPJ) {
    return DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
        DatasetFactory.createConstraint("operacao", "BuscaTransportadora", "BuscaTransportadora", ConstraintType.MUST),
        DatasetFactory.createConstraint("cgccfo", CNPJ, CNPJ, ConstraintType.MUST)
    ], null);
}