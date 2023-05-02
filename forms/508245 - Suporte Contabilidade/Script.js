dataPrazoRetorno = null;

$(document).ready(async () => {
    $(".radioDecisao").on("change", function () {
        if ($(".radioDecisao:checked").val() == "Enviar") {
            $("#divInfoResolucaoChamado").show();
            $("#divInfoObservacao").hide();

            if ($("#categoria").val() == "Entrada de Equipamentos" || $("#categoria").val() == "Devolução de Equipamentos" || $("#categoria").val() == "Devolução de Compras") {
                $("#divAnexoResolucao").show();
            }
            else {
                $("#divAnexoResolucao").hide();
            }

            if ($("#categoria").val() == "Devolução de Compras") {
                $("#inputEncaminhaFinan").show();
                $("#checkboxEncaminhaFinan").prop("checked", true);
            } else {
                $("#inputEncaminhaFinan").hide();
                $("#checkboxEncaminhaFinan").prop("checked", false);
            }
        }
        else if ($(".radioDecisao:checked").val() == "Retornar") {
            $("#divInfoResolucaoChamado").hide();
            $("#divAnexoResolucao").hide();
            $("#divInfoObservacao").show();
            setDataPrazoRetorno();
        }
    });
    $(".inputObservacao, #email, .inputResolucaoChamado, .inputInfoChamado, .inputExclusaoLancamento, .inputEntradaDeEquipamentos, .inputDevolucaoDeEquipamentos, .inputDevolucaoDeCompra, .InputImobilizado, .InputTransfereciaDeEquipamentos").on("click", function () {
        $(this).removeClass("has-error");
    });
    $("#email").on("blur", function () {
        //Verifica se o usuario colocou o proprio email em copia e remove caso verdadeiro
        if ($(this).val() != null && $(this).val() != "") {
            DatasetFactory.getDataset("colleague", ["mail"], [
                DatasetFactory.createConstraint("colleagueId", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST)
            ], null, {
                success: (mail) => {
                    var retorno = "";
                    var emails = $(this).val().trim().split(";");

                    for (let i = 0; i < emails.length; i++) {
                        const email = emails[i];
                        console.log(email.trim() + " - " + mail.values[0]["mail"]);
                        if (email.trim() == mail.values[0]["mail"]) {
                            FLUIGC.toast({
                                message: "O solicitante é automaticamente notificado por e-mail, não sendo necessário estar incluido em cópia.",
                                type: "warning"
                            });
                        } else {
                            retorno += email + "; ";
                        }
                    }

                    $(this).val(retorno.substring(0, retorno.length - 2));
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao verificar e-mail do usuário: ",
                        message: error,
                        type: "warning"
                    });
                }
            });
        }
    });
    $("#categoria").on("change", function () {
        if ($(this).val() == "Exclusão de Lançamento") {
            $("#divCamposExclusaoLancamento").slideDown();
        }
        else {
            $("#divCamposExclusaoLancamento").slideUp();
        }

        if ($(this).val() == "Entrada de Equipamentos") {
            $("#divCamposEntradaDeEquipamento").slideDown();
        }
        else {
            $("#divCamposEntradaDeEquipamento").slideUp();
        }

        if ($(this).val() == "Devolução de Equipamentos") {
            $("#divCamposDevolucaoDeEquipamento").slideDown();
            if ($(this).val() == "Parcial") {
                $("#descEqpDevolucaoDeEqp").closest(".form-input").show();
            }
            else {
                $("#descEqpDevolucaoDeEqp").closest(".form-input").hide();
            }
        }
        else {
            $("#divCamposDevolucaoDeEquipamento").slideUp();
        }

        if ($(this).val() == "Devolução de Compras") {
            $("#divCamposDevolucaoDeCompras").slideDown();
        }
        else {
            $("#divCamposDevolucaoDeCompras").slideUp();
        }
        if ($(this).val() == "Transferencia de Equipamentos de Escritório e Materiais/Peças") {
            $("#divTransferenciaDeImobilizados").slideDown();
        }
        else {
            $("#divTransferenciaDeImobilizados").slideUp();
        }
        if ($(this).val() == "Transferencia de Equipamentos") {
            $("#divCamposTransferenciaDeEquipamento").slideDown();
        }
        else {
            $("#divCamposTransferenciaDeEquipamento").slideUp();
        }
    });
    $("#movimentoExclusaoLancamento").on("blur", function () {
        BuscaMovimento($("#coligadaExclusaoLancamento").val(), $(this).val());
    });
    $("#selectEqpDevolucaoDeEqp").on("change", function () {
        console.log($(this).val());
        if ($(this).val() == "Parcial") {
            $("#descEqpDevolucaoDeEqp").closest(".form-input").slideDown();
        }
        else {
            $("#descEqpDevolucaoDeEqp").closest(".form-input").slideUp();
        }
    });
    $("#movimentoDevolucaoDeCompra, #coligadaDevolucaoDeCompra").on("blur", function () {
        $("#tableItensDevolucaoDeCompra tbody").html("");

        if ($("#movimentoDevolucaoDeCompra").val() != "" && $("#coligadaDevolucaoDeCompra").val() != "") {
            BuscaMovimentoDevolucaoDeCompras($("#coligadaDevolucaoDeCompra").val(), $("#movimentoDevolucaoDeCompra").val()).then(movimento => {
                var html =
                    "<div class='row'>\
                    <div class='col-md-4'>\
                       <b>Coligada:</b> " + movimento.CODCOLIGADA + " - " + movimento.COLIGADA + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Filial:</b> " + movimento.CODFILIAL + " - " + movimento.FILIAL + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Movimento:</b> " + movimento.IDMOV + "\
                    </div>\
                </div>\
                <div class='row'>\
                    <div class='col-md-4'>\
                       <b>Tipo de Movimento:</b> " + movimento.CODTMV + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Fornecedor:</b> " + movimento.CGCCFO + " - " + movimento.FORNECEDOR + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Valor Total:</b> " + FormataValor(movimento.VALOR) + "\
                    </div>\
                </div><br>";


                $("#divMovimentoDevolucaoDeCompra").html(html);
            }).catch(() => {
                $("#divMovimentoDevolucaoDeCompra").html("");
            });


            BuscaItensDaOC($("#coligadaDevolucaoDeCompra").val(), $("#movimentoDevolucaoDeCompra").val()).then(itens => {
                itens.forEach(item => {
                    var html =
                        "<tr>\
                        <td style='text-align: center;'>\
                            <input type='checkbox' class='checkboxSelectItemDevolucaoDeCompra'>\
                        </td>\
                        <td>\
                            " + item.PRODUTO + " - " + item.DESCPRODUTO + "\
                        </td>\
                        <td>\
                            " + item.HISTORICOCURTO + "\
                        </td>\
                        <td>\
                            " + parseFloat(item.QUANTIDADE).toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) + " " + item.CODUND + "\
                        </td>\
                        <td>\
                            <span class='spanValorUnit'>\
                                " + FormataValor(item.PRECOUNITARIO) + "\
                            </span>\
                        </td>\
                        <td>\
                            " + FormataValor(item.VALORBRUTOITEM) + "\
                        </td>\
                        <td>\
                            <input class='form-control inputQuantidadeDevolvida' readonly>\
                        </td>\
                        <td>\
                            <span class='spanValorDevolvido'></span>\
                        </td>\
                    </tr>";
                    $("#tableItensDevolucaoDeCompra tbody").append(html);

                    $("#tableItensDevolucaoDeCompra tbody").find("tr:last").find(".inputQuantidadeDevolvida").on("change keyup", function () {
                        $(this).closest("tr").find(".spanValorDevolvido").text("R$ " + ($(this).maskMoney('unmasked')[0] * $(this).closest("tr").find(".spanValorUnit").text().trim().split("R$")[1].split(".").join("").replace(",", ".")).toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }));
                    });
                    $("#tableItensDevolucaoDeCompra tbody").find("tr:last").find(".inputQuantidadeDevolvida").maskMoney({
                        precision: 2,
                        suffix: " " + item.CODUND
                    });
                    $("#tableItensDevolucaoDeCompra tbody").find("tr:last").find(".inputQuantidadeDevolvida").on("focus", function () {
                        $(this).removeClass("has-error");
                    });
                    $("#tableItensDevolucaoDeCompra tbody").find("tr:last").find(".checkboxSelectItemDevolucaoDeCompra").on("click", function () {
                        if ($(this).is(":checked")) {
                            $(this).closest("tr").find(".inputQuantidadeDevolvida").removeAttr("readonly");
                        }
                        else {
                            $(this).closest("tr").find(".inputQuantidadeDevolvida").attr("readonly", "readonly");
                            $(this).closest("tr").find(".inputQuantidadeDevolvida").val("");
                            $(this).closest("tr").find(".spanValorDevolvido").text("");
                        }
                    });
                });
            }).catch(() => {
                $("#tableItensDevolucaoDeCompra tbody").html("");
            });
        }
    });

    $("#selectFreteImobilizado").on("change", function () {
        if ($(this).val() == "Terceiros") {
            $("#divTransportadoraTransfImob").slideDown();
        }
        else {
            $("#divTransportadoraTransfImob").slideUp();
        }

        if ($(this).val() == "Castilho") {
            $("#divPlacaTransfImob").slideDown();
        }
        else {
            $("#divPlacaTransfImob").slideUp();
        }
    });
    $("#addItemImobilizado").on('click', function () {
        InsereRowTable();
        $(".ValorItemImob").keypress(function() {
            $(this).mask('###.###.###.###,00', {reverse: true});
        });
    })

    $("#selectFreteEquipamentosTransf").on("change", function () {
        if ($(this).val() == "Castilho") {
            $("#divPlacaTransfEquip").slideDown();
        }
        else {
            $("#divPlacaTransfEquip").slideUp();
        }

        if ($(this).val() == "Terceiros") {
            $("#divTransportadoraTransfEquip").slideDown();
        }
        else {
            $("#divTransportadoraTransfEquip").slideUp();
        }
    });
    $("#BotaoAddEquipTransferencia").on('click', function () {
        InsereRowTable();
        $(".ValorTransfEquip").keypress(function() {
            $(this).mask('###.###.###.###,00', {reverse: true});
        });
    })
    
    $("#movimentoExclusaoLancamento").mask("9999999");
    $("#selectFreteDevolucaoDeEqp").on("change", function () {
        if ($(this).val() == "Próprio Remetente") {
            $("#divPlacaTranspDevolucaoDeEqp").slideDown();
        }
        else {
            $("#divPlacaTranspDevolucaoDeEqp").slideUp();
        }

        if ($(this).val() == "Terceiro") {
            $("#divTransportadoraDevolucaoDeEqp").slideDown();
        }
        else {
            $("#divTransportadoraDevolucaoDeEqp").slideUp();
        }
    });
    $("#selectFreteDevolucaoDeCompra").on("change", function () {
        if ($(this).val() == "Próprio Remetente") {
            $("#divPlacaTranspDevolucaoDeCompra").slideDown();
        }
        else {
            $("#divPlacaTranspDevolucaoDeCompra").slideUp();
        }

        if ($(this).val() == "Terceiro") {
            $("#divTransportadoraDevolucaoDeCompra").slideDown();
        }
        else {
            $("#divTransportadoraDevolucaoDeCompra").slideUp();
        }
    });
    $("#inputPlacaDevolucaoDeCompra").mask("AAA-AAAA");
    $("#inputPlacaDevolucaoDeEqp").mask("AAA-AAAA");
    $("#inputPlacaTransfEquip").mask("AAA-AAAA");
    $("#inputPlacaTransfImob").mask("AAA-AAAA");
    $("#NContratoEntradaDeEquipamentos").mask("9.9.999-999/99");
    $("#NContratoEntradaDeEquipamentos").on("blur", function () {
        BuscaContrato().then(contrato => {
            $("#divContratoEntradaDeEquipamentos").html("\
            <div class='panel panel-primary'>\
                <div class='panel-heading'>\
                    <h3 class='panel-title'>Contrato</h3>\
                </div>\
                <div class='panel-body'>\
                    <div class='row'>\
                        <div class='col-md-4'>\
                            <b>Nome: </b><span>" + contrato[0].NOME + "</span>\
                        </div>\
                        <div class='col-md-4'>\
                            <b>Fornecedor: </b><span>" + contrato[0].FORNECEDOR + "</span>\
                        </div>\
                        <div class='col-md-4'>\
                            <b>CNPJ: </b><span>" + contrato[0].CNPJ + "</span>\
                        </div>\
                    </div>\
                    <br>\
                    <div class='row'>\
                        <div class='col-md-4'>\
                            <b>Tipo: </b><span>" + contrato[0].TIPO + "</span>\
                        </div>\
                        <div class='col-md-4'>\
                            <b>STATUS: </b><span>" + contrato[0].STATUS + "</span>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <br>");
        }).catch(() => {
            $("#divContratoEntradaDeEquipamentos").html("");
            $("#NContratoEntradaDeEquipamentos").val("");
        });
    });
    $("input[type='file']").on("change", function () {
        $("#idDoc" + $(this).attr("id").split("inputFile")[1]).val("");

        if ($(this)[0].files.length == 0) {
            $(this).siblings("div").html("Nenhum arquivo selecionado");
        } else if ($(this)[0].files.length == 1) {
            if ($(this).attr("id") != "inputFileContrato") {
                $(this).siblings("div").html("Carregando...");
                CriaDocFluig($(this).attr("id"));
            }
        } else {
            if ($(this).attr("id") != "inputFileContrato") {
                $(this).siblings("div").html("Carregando...");
                CriaDocFluig($(this).attr("id"));
            }
        }
    });
    BuscaCentroDeCusto().then(options => {
        var optSelected = $("#ObraDevolucaoDeEquipamentos").val();
        $("#ObraDevolucaoDeEquipamentos").html("<option></option>" + options);
        $("#ObraDevolucaoDeEquipamentos").val(optSelected);

        var optSelected = $("#CCustoEntradaDeEquipamentos").val();
        $("#CCustoEntradaDeEquipamentos").html("<option></option>" + options);
        $("#CCustoEntradaDeEquipamentos").val(optSelected);

        /*var optSelected = $("#CCustoDeOrigemImobilizado").val();
        $("#CCustoDeOrigemImobilizado").html("<option></option>" + options);
        $("#CCustoDeOrigemImobilizado").val(optSelected);

        var optSelected = $("#CCustoDeOrigTransEquip").val();
        $("#CCustoDeOrigTransEquip").html("<option></option>" + options);
        $("#CCustoDeOrigTransEquip").val(optSelected);*/
    });

    $("#categoria").on('change', function () {
        BuscaCentroDeCusto().then(options => {
            var optSelected = $("#CCustoDeOrigemImobilizado").val();
            $("#CCustoDeOrigemImobilizado").html("<option></option>" + options);
            $("#CCustoDeOrigemImobilizado").val(optSelected);
    
            var optSelected = $("#CCustoDeOrigTransEquip").val();
            $("#CCustoDeOrigTransEquip").html("<option></option>" + options);
            $("#CCustoDeOrigTransEquip").val(optSelected);
        })
        
        BuscaCentroDeCusto(true).then(options => {
            var optSelected = $("#CCustoDeDestinoImobilizado, #CCustoDeDestinoTransEquip").val();
            $("#CCustoDeDestinoImobilizado, #CCustoDeDestinoTransEquip").html("<option></option>" + options);
            $("#CCustoDeDestinoImobilizado, #CCustoDeDestinoTransEquip").val(optSelected);
        })
    })

    BuscaTransportadora().then(transportadora => {
        transportadora.values.forEach(transp => {
            if (transp.CGC == "   -   ") {
                $("#datalistTransport").append("<option value='" + transp.NOME + "'></option>")
            }
            else {
                $("#datalistTransport").append("<option value='" + transp.CGC + " - " + transp.NOME + "'></option>")
            }
        });
    });
    $("#coligadaDevolucaoDeCompra").on("change", function () {
        if ($(this).val() != "" && $(this).val() != 1 && $(this).val() != 2) {
            $(this).val("");
            FLUIGC.toast({
                message: "Coligada sem inscrição estadual!",
                type: "warning"
            });
        }
    });
    $("#ObraDevolucaoDeCompra, #CCustoEntradaDeEquipamentos, #ObraDevolucaoDeEquipamentos").on("change", function () {
        if ($(this).val().split(" - ")[0] != "" && $(this).val().split(" - ")[0] != 1 && $(this).val().split(" - ")[0] != 2) {
            $(this).val("");
            FLUIGC.toast({
                message: "Coligada sem inscrição estadual!",
                type: "warning"
            });
        }
    });


    var atividade = $("#atividade").val();
    var formMode = $("#formMode").val();
    if (formMode == "ADD") {
        FLUIGC.calendar("#data_ocorrencia");
        FLUIGC.calendar("#dataEntradaDevolucaoDeEqp");
        FLUIGC.calendar("#dataRetiradaDevolucaoDeEqp");
        FLUIGC.calendar("#dataEntradaDevolucaoDeCompra");
        FLUIGC.calendar("#dataRetiradaDevolucaoDeCompra");
        FLUIGC.calendar("#data_saida_equipamento");
        FLUIGC.calendar("#data_saidaTransfEquip");
        $("#divResolucaoChamado, #divCamposExclusaoLancamento, #divCamposEntradaDeEquipamento, #divCamposDevolucaoDeEquipamento, #divCamposDevolucaoDeCompras, #divPlacaTranspDevolucaoDeEqp, #divTransportadoraDevolucaoDeEqp, #divTransportadoraDevolucaoDeCompra, #divPlacaTranspDevolucaoDeCompra, #divTransportadoraTransfImob, #divPlacaTransfImob, #divTransferenciaDeImobilizados, #divCamposTransferenciaDeEquipamento, #divTransportadoraTransfEquip, #divPlacaTransfEquip").hide();
        BuscaListDeUsuariosAD($("#solicitante").val());
        $("#atabHistorico").closest("li").hide();
        BuscaObras($("#userCode").val());
        BuscaColigadas();
    }
    else if (formMode == "MOD") {
        FLUIGC.calendar("#data_ocorrencia");
        FLUIGC.calendar("#dataEntradaDevolucaoDeEqp");
        FLUIGC.calendar("#dataRetiradaDevolucaoDeEqp");
        FLUIGC.calendar("#dataEntradaDevolucaoDeCompra");
        FLUIGC.calendar("#dataRetiradaDevolucaoDeCompra");
        FLUIGC.calendar("#data_saida_equipamento");
        FLUIGC.calendar("#data_saidaTransfEquip");
        $(".radioDecisao:checked").attr("checked", false);
        $(".radioDecisaoConclusao:checked").attr("checked", false);
        $("#observacao, #solucao, #divDecisaoConclusao").val("");
        $(".divAnexo, #divAnexoResolucao, #divBotao").hide();
        BuscaComplementos();
        BuscaObras($("#userCode").val());

        BuscaCentroDeCusto(true).then(options => {
            var optSelected = $("#CCustoDeDestinoImobilizado, #CCustoDeDestinoTransEquip").val();
            $("#CCustoDeDestinoImobilizado, #CCustoDeDestinoTransEquip").html("<option></option>" + options);
            $("#CCustoDeDestinoImobilizado, #CCustoDeDestinoTransEquip").val(optSelected);
        })
        

        if (atividade == 4) {
            BuscaTransportadora().then(transportadora => {
                transportadora.values.forEach(transp => {
                    if (transp.CGC == "   -   ") {
                        $("#datalistTransport").append("<option value='" + transp.NOME + "'></option>")
                    }
                    else {
                        $("#datalistTransport").append("<option value='" + transp.CGC + " - " + transp.NOME + "'></option>")
                    }
                });
            });
            $("#divDecisao, #divDecisaoConclusao, #divInfoResolucaoChamado").hide();
            BloqueiaCamposInfoChamado();
            $("#data_prazo_retorno").closest(".form-input").hide();
        }
        else if (atividade == 5) {
            BloqueiaCamposInfoChamado();
            $("#divInfoResolucaoChamado, #divInfoObservacao, #divDecisaoConclusao, #divBotao").closest("div").hide();
            dataPrazoRetorno = FLUIGC.calendar("#data_prazo_retorno");
        }

        if ($("#categoria").val() == "Exclusão de Lançamento") {
            $("#divCamposExclusaoLancamento").show();
            $("#coligadaExclusaoLancamento").closest(".form-input").hide();
            $("#movimentoExclusaoLancamento").closest(".form-input").hide();
            $("#checkboxCancelarMovOrigem").on("click", () => { return false; });

            BuscaMovimento($("#coligadaExclusaoLancamento").val(), $("#movimentoExclusaoLancamento").val());

            if ($("#checkboxCancelarMovOrigem").is(":checked")) {
                BuscaMovimentoOrigem($("#coligadaExclusaoLancamento").val(), $("#movimentoExclusaoLancamento").val());
            }

        }
        else {
            $("#divCamposExclusaoLancamento").hide();
        }

        if ($("#categoria").val() == "Entrada de Equipamentos") {
            $("#divCamposEntradaDeEquipamento").show();

            if ($("#NContratoEntradaDeEquipamentos").val() != "" && $("#NContratoEntradaDeEquipamentos").val() != null && $("#NContratoEntradaDeEquipamentos").val() != undefined) {
                BuscaContrato().then(contrato => {
                    $("#divContratoEntradaDeEquipamentos").html("\
                    <div class='panel panel-primary'>\
                        <div class='panel-heading'>\
                            <h3 class='panel-title'>Contrato</h3>\
                        </div>\
                        <div class='panel-body'>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Nome: </b><span>" + contrato[0].NOME + "</span>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Fornecedor: </b><span>" + contrato[0].FORNECEDOR + "</span>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>CNPJ: </b><span>" + contrato[0].CNPJ + "</span>\
                                </div>\
                            </div>\
                            <br>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Tipo: </b><span>" + contrato[0].TIPO + "</span>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>STATUS: </b><span>" + contrato[0].STATUS + "</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <br>");
                }).catch(() => {
                    $("#divContratoEntradaDeEquipamentos").html("");
                });
            }
            else {
                $("#NContratoEntradaDeEquipamentos").siblings("div").text("Sem Contrato");
            }


            /*$("#coligadaExclusaoLancamento").closest(".form-input").hide();
            $("#movimentoExclusaoLancamento").closest(".form-input").hide();
            $("#checkboxCancelarMovOrigem").on("click", ()=>{return false;});*/

            /*BuscaMovimento($("#coligadaExclusaoLancamento").val() , $("#movimentoExclusaoLancamento").val());

            if ($("#checkboxCancelarMovOrigem").is(":checked")) {
                BuscaMovimentoOrigem($("#coligadaExclusaoLancamento").val() , $("#movimentoExclusaoLancamento").val());
            }*/

        }
        else {
            $("#divCamposEntradaDeEquipamento").hide();
        }

        if ($("#categoria").val() == "Devolução de Equipamentos") {
            $("#divCamposDevolucaoDeEquipamento").show();
            if ($("#selectEqpDevolucaoDeEqp").val() == "Parcial") {
                $("#descEqpDevolucaoDeEqp").closest(".form-input").show();
            }
            else {
                $("#descEqpDevolucaoDeEqp").closest(".form-input").hide();
            }

            if (($("#selectTransporteDevolucaoDeEqp").val() == "Terceiro" || $("#selectFreteDevolucaoDeEqp").val() == "Próprio Remetente") && $("#selectFreteDevolucaoDeEqp").val() != "Sem Frete") {
                $("#divTransportadoraDevolucaoDeEqp, #divPlacaTranspDevolucaoDeEqp").show();
            } else {
                $("#divTransportadoraDevolucaoDeEqp, #divPlacaTranspDevolucaoDeEqp").hide();
            }
        }
        else {
            $("#divCamposDevolucaoDeEquipamento").hide();
        }

        if ($("#categoria").val() == "Devolução de Compras") {
            $("#divCamposDevolucaoDeCompras").show();
            $("#CNPJTranspDevolucaoDeCompra").trigger("blur");
            $("#movimentoDevolucaoDeCompra, #coligadaDevolucaoDeCompra").closest(".form-input").hide();

            BuscaMovimentoDevolucaoDeCompras($("#coligadaDevolucaoDeCompra").val(), $("#movimentoDevolucaoDeCompra").val()).then(movimento => {
                var html =
                    "<div class='row'>\
                    <div class='col-md-4'>\
                       <b>Coligada:</b> " + movimento.CODCOLIGADA + " - " + movimento.COLIGADA + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Filial:</b> " + movimento.CODFILIAL + " - " + movimento.FILIAL + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Movimento:</b> " + movimento.IDMOV + "\
                    </div>\
                </div>\
                <div class='row'>\
                    <div class='col-md-4'>\
                       <b>Tipo de Movimento:</b> " + movimento.CODTMV + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Fornecedor:</b> " + movimento.CGCCFO + " - " + movimento.FORNECEDOR + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Valor Total:</b> " + FormataValor(movimento.VALOR) + "\
                    </div>\
                </div><br>";


                $("#divMovimentoDevolucaoDeCompra").html(html);
            }).catch(() => {
                $("#divMovimentoDevolucaoDeCompra").html("");
            });

            GeraItensDevolucaoCompras();

            if (($("#selectFreteDevolucaoDeCompra").val() == "Terceiro" || $("#selectFreteDevolucaoDeCompra").val() == "Próprio Remetente") && $("#selectFreteDevolucaoDeCompra").val() != "Sem Frete") {
                $("#divTransportadoraDevolucaoDeCompra, #divPlacaTranspDevolucaoDeCompra").show();
            } else {
                $("#divTransportadoraDevolucaoDeCompra, #divPlacaTranspDevolucaoDeCompra").hide();
            }
        }
        else {
            $("#divCamposDevolucaoDeCompras").hide();
        }

        if ($("#categoria").val() == "Transferencia de Equipamentos de Escritório e Materiais/Peças") {
            $("#divTransferenciaDeImobilizados").show();
            InsereItensNaTable();
            if ($("#selectFreteImobilizado").val() == "Terceiros"){  
                $("#divTransportadoraTransfImob").show();
                $("#divPlacaTransfImob").hide();
            } 
            else if($("#selectFreteImobilizado").val() == "Castilho") {
                $("#divPlacaTransfImob").show();
                $("#divTransportadoraTransfImob").hide();
            }
            else{
                $("#divTransportadoraTransfImob, #divPlacaTransfImob").hide();
            }
            $(".ValorItemImob").keypress(function() {
                $(this).mask('###.###.###.###,00', {reverse: true});
            });
        }
        else {
            $("#divTransferenciaDeImobilizados").hide();
        }

        if ($("#categoria").val() == "Transferencia de Equipamentos") {

            $("#divCamposTransferenciaDeEquipamento").show();
            InsereItensNaTable();
            $(".ValorTransfEquip").keypress(function() {
                $(this).mask('###.###.###.###,00', {reverse: true});
            });

            if ($("#selectFreteEquipamentosTransf").val() == "Terceiros"){  
                $("#divTransportadoraTransfEquip").show();
                $("#divPlacaTransfEquip").hide();
            } 
            else if($("#selectFreteEquipamentosTransf").val() == "Castilho") {
                $("#divPlacaTransfEquip").show();
                $("#divTransportadoraTransfEquip").hide();
            }
            else{
                $("#divTransportadoraTransfEquip, #divPlacaTransfEquip").hide();
            }
        }
        else {
            $("#divCamposTransferenciaDeEquipamento").hide();
        }

    }
    else if (formMode == "VIEW") {
        BuscaComplementos();
        BloqueiaCamposInfoChamado();
        $("#divResolucaoChamado, #divAnexoNF").hide();
        $(".divAnexo, #divAnexoResolucao, #divBotao").hide();


        if ($("#categoria").text() == "Exclusão de Lançamento") {
            $("#divCamposExclusaoLancamento").show();
            $("#coligadaExclusaoLancamento").closest(".form-input").hide();
            $("#movimentoExclusaoLancamento").closest(".form-input").hide();
            $("#checkboxCancelarMovOrigem").on("click", () => { return false; });

            BuscaMovimento($("#coligadaExclusaoLancamento").text(), $("#movimentoExclusaoLancamento").text());

            if ($("#checkboxCancelarMovOrigem").is(":checked")) {
                BuscaMovimentoOrigem($("#coligadaExclusaoLancamento").text(), $("#movimentoExclusaoLancamento").text());
            }

        }
        else {
            $("#divCamposExclusaoLancamento").hide();
        }

        if ($("#categoria").text() == "Entrada de Equipamentos (Terceiros)") {
            $("#divCamposEntradaDeEquipamento").show();

            if ($("#NContratoEntradaDeEquipamentos").text() != "" && $("#NContratoEntradaDeEquipamentos").text() != null && $("#NContratoEntradaDeEquipamentos").text() != undefined) {
                BuscaContrato().then(contrato => {
                    $("#divContratoEntradaDeEquipamentos").html("\
                    <div class='panel panel-primary'>\
                        <div class='panel-heading'>\
                            <h3 class='panel-title'>Contrato</h3>\
                        </div>\
                        <div class='panel-body'>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Nome: </b><span>" + contrato[0].NOME + "</span>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Fornecedor: </b><span>" + contrato[0].FORNECEDOR + "</span>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>CNPJ: </b><span>" + contrato[0].CNPJ + "</span>\
                                </div>\
                            </div>\
                            <br>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Tipo: </b><span>" + contrato[0].TIPO + "</span>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>STATUS: </b><span>" + contrato[0].STATUS + "</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <br>");
                }).catch(() => {
                    $("#divContratoEntradaDeEquipamentos").html("");
                });
            }
            else {
                $("#NContratoEntradaDeEquipamentos").siblings("div").text("Sem Contrato");
            }


            /*$("#coligadaExclusaoLancamento").closest(".form-input").hide();
            $("#movimentoExclusaoLancamento").closest(".form-input").hide();
            $("#checkboxCancelarMovOrigem").on("click", ()=>{return false;});*/

            /*BuscaMovimento($("#coligadaExclusaoLancamento").text() , $("#movimentoExclusaoLancamento").text());
            if ($("#checkboxCancelarMovOrigem").is(":checked")) {
                BuscaMovimentoOrigem($("#coligadaExclusaoLancamento").text() , $("#movimentoExclusaoLancamento").text());
            }*/

        }
        else {
            $("#divCamposEntradaDeEquipamento").hide();
        }

        if ($("#categoria").text() == "Devolução de Equipamentos (Terceiros)") {
            $("#divCamposDevolucaoDeEquipamento").show();
            if ($("#selectEqpDevolucaoDeEqp").text() == "Parcial") {
                $("#descEqpDevolucaoDeEqp").closest(".form-input").show();
            }
            else {
                $("#descEqpDevolucaoDeEqp").closest(".form-input").hide();
            }

            if (($("#selectFreteDevolucaoDeEqp").text() == "Terceiro" || $("#selectFreteDevolucaoDeEqp").text() == "Próprio Remetente") && $("#selectFreteDevolucaoDeEqp").text() != "Sem Frete") {
                $("#divTransportadoraDevolucaoDeEqp, #divPlacaTranspDevolucaoDeEqp").show();
            } else {
                $("#divTransportadoraDevolucaoDeEqp, #divPlacaTranspDevolucaoDeEqp").hide();
            }
        }
        else {
            $("#divCamposDevolucaoDeEquipamento").hide();
        }

        if ($("#categoria").text() == "Devolução de Compras (Terceiros)") {
            $("#divCamposDevolucaoDeCompras").show();
            $("#CNPJTranspDevolucaoDeCompra").trigger("blur");
            $("#movimentoDevolucaoDeCompra, #coligadaDevolucaoDeCompra").closest(".form-input").hide();

            BuscaMovimentoDevolucaoDeCompras($("#coligadaDevolucaoDeCompra").text(), $("#movimentoDevolucaoDeCompra").text()).then(movimento => {
                var html =
                    "<div class='row'>\
                    <div class='col-md-4'>\
                       <b>Coligada:</b> " + movimento.CODCOLIGADA + " - " + movimento.COLIGADA + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Filial:</b> " + movimento.CODFILIAL + " - " + movimento.FILIAL + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Movimento:</b> " + movimento.IDMOV + "\
                    </div>\
                </div>\
                <div class='row'>\
                    <div class='col-md-4'>\
                       <b>Tipo de Movimento:</b> " + movimento.CODTMV + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Fornecedor:</b> " + movimento.CGCCFO + " - " + movimento.FORNECEDOR + "\
                    </div>\
                    <div class='col-md-4'>\
                        <b>Valor Total:</b> " + FormataValor(movimento.VALOR) + "\
                    </div>\
                </div><br>";


                $("#divMovimentoDevolucaoDeCompra").html(html);
            }).catch(() => {
                $("#divMovimentoDevolucaoDeCompra").html("");
            });

            GeraItensDevolucaoCompras();

            if (($("#selectFreteDevolucaoDeCompra").text() == "Terceiro" || $("#selectFreteDevolucaoDeCompra").text() == "Próprio Remetente") && $("#selectFreteDevolucaoDeCompra").text() != "Sem Frete") {
                $("#divTransportadoraDevolucaoDeCompra, #divPlacaTranspDevolucaoDeCompra").closest(".form-input").show();
            } else {
                $("#divTransportadoraDevolucaoDeCompra, #divPlacaTranspDevolucaoDeCompra").hide();
            }
        }
        else {
            $("#divCamposDevolucaoDeCompras").hide();
        }
        if ($("#categoria").text() == "Transferencia de Equipamentos de Escritório e Materiais/Peças") {
            /*$(".InputImobilizado, .DescItemImob, .PrefixItemImob, .QuantItemImob, .ValorItemImob").attr('style', "background-color: #fff; color: black;  pointer-events: none; touch-action: none;");
            $(".InputImobilizado, .DescItemImob, .PrefixItemImob, .QuantItemImob, .ValorItemImob").attr('readonly', true);*/
            InsereItensNaTable();
            $("#divTransferenciaDeImobilizados").show();
        }
        else {
            $("#divTransferenciaDeImobilizados").hide();
        }
        if ($("#categoria").text() == "Transferencia de Equipamentos") {
            /*$(".InputImobilizado, .DescItemImob, .PrefixItemImob, .QuantItemImob, .ValorItemImob").attr('style', "background-color: #fff; color: black;  pointer-events: none; touch-action: none;");
            $(".InputImobilizado, .DescItemImob, .PrefixItemImob, .QuantItemImob, .ValorItemImob").attr('readonly', true);*/
            InsereItensNaTable();
            $("#divTransferenciaDeImobilizados").show();
        }
        else {
            $("#divTransferenciaDeImobilizados").hide();
        }
    }
});