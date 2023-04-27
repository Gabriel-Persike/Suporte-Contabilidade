function BuscaListDeUsuariosAD(solicitante = null) {
    var callback = {
        success: (listUsuarios) => {
            if (listUsuarios.values[0].error == undefined) {
                $("#usuario").html("<option></option>");
                for (var i = 0; i < listUsuarios.values.length; i++) {
                    $("#usuario").append("<option values='" + listUsuarios.values[i].usuarioAD + "'>" + listUsuarios.values[i].usuarioAD + "</option>");
                }
                if (solicitante != null) {
                    $("#usuario").val(solicitante);
                }
            }
            else {
                $("#usuario").html("<option></option>");
                $("#usuario").append("<option values='gabriel.persike'>gabriel.persike</option>");
                $("#usuario").append("<option values='diogo.franca'>diogo.franca</option>");
                $("#usuario").append("<option values='paulo.monteiro'>paulo.monteiro</option>");
                $("#usuario").append("<option values='vitor.vale'>vitor.vale</option>");

                if (solicitante != null) {
                    $("#usuario").val(solicitante);
                }
            }
        },
        error: (error) => {
            FLUIGC.toast({
                title: "Erro ao buscar lista de usuários: ",
                message: error,
                type: "warning"
            });
        }
    }

    DatasetFactory.getDataset("ZRUsuariosAD", null, [], null, callback);
}

function CalculaTempoConcluido(dataConclusao) {
    var dif = Math.abs(new Date(dataConclusao) - new Date());

    var difDias = Math.ceil(dif / (1000 * 60 * 60 * 24));
    if (difDias > 1) {
        return difDias + " dias atrás";
    }
    else {
        var difHoras = Math.ceil(dif / (1000 * 60 * 60));
        if (difHoras > 1) {
            return (difHoras - 1) + " horas atrás";
        }
        else {
            var difMinutos = Math.ceil(dif / (1000 * 60));
            return difMinutos + " minutos atrás";
        }
    }
}

function FormataData(data, dataEHorario = false) {
    var horario = "";

    if (dataEHorario) {
        data = data.split(" ");
        horario = data[1];
        data = data[0];
    }

    data = data.split("-");
    var retorno = data[2] + "/" + data[1] + "/" + data[0];
    if (horario) {
        retorno += " " + horario.split(".")[0];
    }

    return retorno;
}

function BuscaComplementos() {
    DatasetFactory.getDataset("BuscaComplementosDeSolicitacao", null, [
        DatasetFactory.createConstraint("numSolic", $("#numProces").val(), $("#numProces").val(), ConstraintType.MUST),
    ], null, {
        success: async (data) => {
            $("#atabHistorico").text("Histórico (" + data.values.length + ")");
            var listComplementos = data.values;
            for (var i = 0; i < listComplementos.length; i++) {
                const complemento = listComplementos[i];
                if (["4", "5"].includes(complemento.NUM_SEQ)) {
                    await BuscaImagemUsuario(complemento.COLLEAGUE_ID).then(imgUser => {
                        var htmlHistorico =
                            `<div class="row">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-body" style='display:flex;'>
                                        <div class='imgUser' style='margin-right: 10px;'>
                                        </div>
                                        <div>
                                            <h3 class="card-title">`+ BuscaNomeUsuario(complemento.COLLEAGUE_ID) + `</b></h3>
                                            <span class="card-subtitle mb-2 text-muted">` + FormataData(complemento.DT_OBSERVATION, true) + " - " + CalculaTempoConcluido(complemento.DT_OBSERVATION) + `</span>
                                            <p class="card-text">` + complemento.OBSERVATION.split("<p>").join("").split("</p>").join("").split("\n").join("<br>") + `</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;

                        $("#divHistorico").append(htmlHistorico);
                        $("#divHistorico").find(".row:last").find(".imgUser").append(imgUser);
                    }).catch((error) => {
                        console.log("Erro ao buscar imagem de usuário: " + error);
                    });
                }
            }
        },
        error: (error) => {
            console.log("Erro ao buscar complementos:" + error);
            FLUIGC.toast({
                title: "Erro ao buscar complementos: ",
                message: error,
                type: "warning"
            });
        }
    });
}

function BuscaImagemUsuario(usuario) {
    return new Promise(async (resolve, reject) => {
        const res = await fetch("/api/public/social/image/" + usuario);//Prod
        const blob = await res.blob();
        const img = new Image();
        img.width = "40";
        img.height = "40";
        img.src = URL.createObjectURL(blob);
        await img.decode();
        resolve(img);
    });
}

function BuscaNomeUsuario(usuario) {
    return DatasetFactory.getDataset("colleague", ["colleagueName"], [
        DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)
    ], null).values[0].colleagueName;
}

function BloqueiaCamposInfoChamado() {
    if ($("#formMode").val() == "VIEW") {
        $(".inputInfoChamado, .inputExclusaoLancamento, .inputEntradaDeEquipamentos, .inputDevolucaoDeEquipamentos, .inputDevolucaoDeCompra, .inputDevolucaoDeEqp, .InputImobilizado").each(function () {
            if ($(this).attr("id") == "coligadaExclusaoLancamento") {
                $(this).siblings("div:first").html($(this).find("option:selected").text());
            } else {
                $(this).siblings("div:first").text($(this).text().split("\n").join("<br>"));
            }

            $(this).hide();
        });

        $(".radioInfoChamado").on("click", () => { return false });
    }
    else if($("#atividade").val() == 4){
        $(".inputInfoChamado, .inputExclusaoLancamento, .inputEntradaDeEquipamentos, .inputDevolucaoDeEquipamentos, .inputDevolucaoDeCompra, .inputDevolucaoDeEqp").each(function () {
            if ($(this).attr("id") == "CCustoEntradaDeEquipamentos" || $(this).attr("id") == "DeptoEntradaDeEquipamentos" || $(this).attr("id") == "ObraDevolucaoDeCompra" || $(this).attr("id") == "coligadaExclusaoLancamento" || $(this).attr("id") == "coligadaDevolucaoDeCompra") {
                $(this).siblings("div:first").text($(this).find("option:selected").text());
            }
            else {
                $(this).siblings("div:first").html($(this).val().split("\n").join("<br>"));
            }
            $(this).hide();
        });

        $(".radioInfoChamado").on("click", () => { return false });
    }
    else {
        $(".inputInfoChamado, .inputExclusaoLancamento, .inputEntradaDeEquipamentos, .inputDevolucaoDeEquipamentos, .inputDevolucaoDeCompra, .inputDevolucaoDeEqp, .InputImobilizado").each(function () {
            if ($(this).attr("id") == "CCustoEntradaDeEquipamentos" || $(this).attr("id") == "DeptoEntradaDeEquipamentos" || $(this).attr("id") == "ObraDevolucaoDeCompra" || $(this).attr("id") == "coligadaExclusaoLancamento" || $(this).attr("id") == "coligadaDevolucaoDeCompra") {
                $(this).siblings("div:first").text($(this).find("option:selected").text());
            }
            else {
                $(this).siblings("div:first").html($(this).val().split("\n").join("<br>"));
            }
            $(this).hide();
        });

        $(".radioInfoChamado").on("click", () => { return false });
    }
}

function ValidaCampos() {
    var atividade = $("#atividade").val();
    var formMode = $("#formMode").val();

    var valida = true;
    if (atividade == 0 || atividade == 4) {
        $(".inputInfoChamado").each(function () {
            if ($(this).val() == null || $(this).val() == undefined || $(this).val() == "") {
                $(this).addClass("has-error");

                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Campo não preenchido!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }

            if ($(this).prop("id") == "problema" && $(this).val().length < 15) {
                $(this).addClass("has-error");
                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "O campo Observação deve conter pelo menos 15 caracteres!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        });

        if (atividade == 4) {
            if ($("#observacao").val() == "" || $("#observacao").val() == null) {
                $("#observacao").addClass("has-error");

                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Campo não preenchido!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#observacao").offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        }

        if ($("#categoria").val() == "Exclusão de Lançamento") {
            $(".inputExclusaoLancamento").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    $(this).addClass("has-error");

                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            });
        }
        else if ($("#categoria").val() == "Entrada de Equipamentos") {
            $(".inputEntradaDeEquipamentos").each(function () {
                if ($(this).attr("id") != "NContratoEntradaDeEquipamentos") {
                    if ($(this).val() == "" || $(this).val() == null) {
                        $(this).addClass("has-error");
                        if (valida == true) {
                            valida = false;
                            FLUIGC.toast({
                                message: "Campo não preenchido!",
                                type: "warning"
                            });
                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).offset().top - (screen.height * 0.15)
                            }, 700);
                        }
                    }
                }
            });

            if ($("#idDocNFRemessa").val() == "" || $("#idDocNFRemessa").val() == null) {
                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Nota fiscal de remessa não anexada!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#divAnexoNFEntradaDeEquipamentos").offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        }
        else if ($("#categoria").val() == "Devolução de Equipamentos") {
            $(".inputDevolucaoDeEqp").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    if ($(this).attr("id") == "CNPJTranspDevolucaoDeEqp") {
                        if ($("#selectFreteDevolucaoDeEqp").val() == "Terceiro") {
                            $(this).addClass("has-error");
                            if (valida == true) {
                                valida = false;
                                FLUIGC.toast({
                                    message: "Campo não preenchido!",
                                    type: "warning"
                                });
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.15)
                                }, 700);
                            }
                        }
                    }
                    else if ($(this).attr("id") == "inputPlacaDevolucaoDeEqp") {
                        if ($("#selectFreteDevolucaoDeEqp").val() == "Próprio Remetente") {
                            $(this).addClass("has-error");
                            if (valida == true) {
                                valida = false;
                                FLUIGC.toast({
                                    message: "Campo não preenchido!",
                                    type: "warning"
                                });
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.15)
                                }, 700);
                            }
                        }
                    }
                    else if ($(this).attr("id") == "descEqpDevolucaoDeEqp" && $("#selectEqpDevolucaoDeEqp").val() != "Parcial") {

                    }
                    else {
                        $(this).addClass("has-error");
                        if (valida == true) {
                            valida = false;
                            FLUIGC.toast({
                                message: "Campo não preenchido!",
                                type: "warning"
                            });
                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).offset().top - (screen.height * 0.15)
                            }, 700);
                        }
                    }
                }
            });

            if ($("#idDocNFOrigem").val() == "" || $("#idDocNFOrigem").val() == null) {
                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Nota fiscal de origem não anexada!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#divAnexoNFDevolucaoDeEqp").offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        }
        else if ($("#categoria").val() == "Devolução de Compras") {
            $(".inputDevolucaoDeCompra").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    if ($(this).attr("id") == "CNPJTranspDevolucaoDeCompra") {
                        if ($("#selectFreteDevolucaoDeCompra").val() == "Terceiro") {
                            $(this).addClass("has-error");
                            if (valida == true) {
                                valida = false;
                                FLUIGC.toast({
                                    message: "Campo não preenchido!",
                                    type: "warning"
                                });
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.15)
                                }, 700);
                            }
                        }
                    }
                    else if ($(this).attr("id") == "inputPlacaDevolucaoDeCompra") {
                        if ($("#selectFreteDevolucaoDeCompra").val() == "Próprio Remetente") {
                            $(this).addClass("has-error");
                            if (valida == true) {
                                valida = false;
                                FLUIGC.toast({
                                    message: "Campo não preenchido!",
                                    type: "warning"
                                });
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.15)
                                }, 700);
                            }
                        }
                    }
                    else {
                        $(this).addClass("has-error");
                        if (valida == true) {
                            valida = false;
                            FLUIGC.toast({
                                message: "Campo não preenchido!",
                                type: "warning"
                            });
                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).offset().top - (screen.height * 0.15)
                            }, 700);
                        }
                    }
                }
            });

            if (atividade == 0) {
                var countItens = 0;
                $("#tableItensDevolucaoDeCompra tbody").find("tr").each(function () {
                    if ($(this).find(".checkboxSelectItemDevolucaoDeCompra").is(":checked")) {
                        countItens++;
                        if ($(this).find(".inputQuantidadeDevolvida").val() == "" || $(this).find(".inputQuantidadeDevolvida").val() == null) {
                            $(this).find(".inputQuantidadeDevolvida").addClass("has-error");
                            if (valida == true) {
                                valida = false;
                                FLUIGC.toast({
                                    message: "Campo não preenchido!",
                                    type: "warning"
                                });
                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.15)
                                }, 700);
                            }
                        }
                    }
                });

                if (countItens < 1) {
                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Nenhum item selecionado para devolução!",
                            type: "warning"
                        });
                    }
                }
            }

            if (valida == true && atividade == 0) {
                SalvaItensDevolucaoCompras();
            }

            if ($("#idDocNFDevCompras").val() == "" || $("#idDocNFDevCompras").val() == null) {
                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Nota fiscal não anexada!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#divAnexoNFDevolucaoDeCompra").offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        }
        else if($("#categoria").val() == "Transferencia de Imobilizado"){
            $(".InputImobilizado, .InputTabelaImobilizado").each(function () {
                if ($(this).val() == "" || $(this).val() == null) {
                    $(this).addClass("has-error");

                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            });
            var ListImobilizados = [];
            $(".trTableTransferenciaImoblizados").each(function () {
            var json = {
                DescricaoImob: $(this).find(".DescItemImob").val(),
                PrefixoImob: $(this).find(".PrefixItemImob").val(),
                QuantidadeImob: $(this).find(".QuantItemImob").val(),
                ValorImob: $(this).find(".ValorItemImob").val(),
            };
                ListImobilizados.push(json);
            });
            $("#jsonItensImobilizado").val(JSON.stringify(ListImobilizados))
        }
    }
    else if (atividade == 5) {
        $(".inputInfoChamado").each(function () {
            if ($(this).val() == null || $(this).val() == undefined || $(this).val() == "") {
                $(this).addClass("has-error");

                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Campo não preenchido!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        });

        if ($(".radioDecisao:checked").val() == "Enviar" || $(".radioDecisao:checked").val() == "Encerrar") {
            $(".inputResolucaoChamado").each(function () {
                if ($(this).val() == null || $(this).val() == undefined || $(this).val() == "") {
                    $(this).addClass("has-error");

                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Campo não preenchido!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            });

            if ($("#categoria").val() == "Devolução de Equipamentos" || $("#categoria").val() == "Devolução de Compras") {
                if ($("#idDocAnexoResolucao").val() == "" || $("#idDocAnexoResolucao").val() == null) {
                    if (valida == true) {
                        valida = false;
                        FLUIGC.toast({
                            message: "Documento não anexado!",
                            type: "warning"
                        });
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $("#divAnexoResolucao").offset().top - (screen.height * 0.15)
                        }, 700);
                    }
                }
            }
        }
        else if ($(".radioDecisao:checked").val() == "Retornar") {
            if ($("#data_prazo_retorno").val() == "" || $("#data_prazo_retorno").val() == null) {
                $("#data_prazo_retorno").addClass("has-error");
                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Campo não preenchido!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#data_prazo_retorno").offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
            if ($("#observacao").val() == "" || $("#observacao").val() == null) {
                $("#observacao").addClass("has-error");

                if (valida == true) {
                    valida = false;
                    FLUIGC.toast({
                        message: "Campo não preenchido!",
                        type: "warning"
                    });
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#observacao").offset().top - (screen.height * 0.15)
                    }, 700);
                }
            }
        }
        else {
            throw "Nenhuma decisão selecionada!";
        }
    }

    if (valida == true) {
        valida = ValidaEmailsEmCopia();
    }

    return valida;
}

async function BuscaObras(usuario) {
    try {
        var optSelected = $("#obra").val();
        var usuarioTI = await VerificaSeUsuarioTI(usuario);

        var constraints = [
            DatasetFactory.createConstraint("groupId", "Obra%", "Obra%", ConstraintType.SHOULD, true),
            DatasetFactory.createConstraint("groupId", "Britagem%", "Britagem%", ConstraintType.SHOULD, true),
            DatasetFactory.createConstraint("groupId", "Regional%", "Regional%", ConstraintType.SHOULD, true),
            DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD),
            DatasetFactory.createConstraint("groupId", "Central de Equipamentos", "Central de Equipamentos", ConstraintType.SHOULD)
        ];

        var dsName = 'group';
        if (usuarioTI != "true") {//Se usuario nao for TI filtra as obras que o usuario esta no grupo
            constraints.push(DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST));
            dsName = "colleagueGroup";//Se usuario nao for TI busca do Dataset colleagueGroup para filtrar por usuario
        }

        DatasetFactory.getDataset(dsName, ["groupId"], constraints, ["groupId"], {
            success: (obras) => {
                $("#obra").html("<option></option>");
                if (obras.values.length > 0) {
                    for (let i = 0; i < obras.values.length; i++) {
                        const obra = obras.values[i];
                        $("#obra").append("<option value='" + obra['groupId'] + "'>" + obra['groupId'] + "</option>");
                    }
                } else {//Se nao retornou nenhuma obra mostra a opcao Sem Obra
                    $("#obra").append("<option value='Sem Obra - Favor informar a obra na descrição do chamado'>Sem Obra - Favor informar a obra na descrição do chamado</option>");
                }

                if ($("#obra option[value='" + optSelected + "']").length < 1 && optSelected != null) {//Verifica se a opcao selecionada esta criada, necessario para a opcao Sem obra
                    $("#obra").append("<option value='" + optSelected + "'>" + optSelected + "</option>");
                }

                $("#obra").val(optSelected);//Retorna para a opcao selecionada antes de buscar as obras
            },
            error: (error) => {
                throw error;
            }
        });
    } catch (error) {
        FLUIGC.toast({
            title: "Erro ao buscar obras: ",
            message: error,
            type: "warning"
        });
    }
}

function VerificaSeUsuarioTI(usuario) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("colleagueGroup", null, [
            DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST),
            DatasetFactory.createConstraint("groupId", "Suporte TI", "Suporte TI", ConstraintType.MUST)
        ], null, {
            success: (grupos) => {
                if (grupos.values.length > 0) {
                    resolve("true");
                }
                else {
                    resolve("false");
                }
            },
            error: (error) => {
                reject(error);
            }
        })
    });
}

function setDataPrazoRetorno() {
    var date = new Date();
    var endDate = "", noOfDaysToAdd = 3, count = 0;
    while (count < noOfDaysToAdd) {
        endDate = new Date(date.setDate(date.getDate() + 1));
        if (endDate.getDay() != 0 && endDate.getDay() != 6) {
            //Date.getDay() gives weekday starting from 0(Sunday) to 6(Saturday)
            count++;
        }
    }
    dataPrazoRetorno.setDate(date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear());
}

function ValidaEmailsEmCopia() {
    if ($("#email").val() == "") {
        return true;
    }

    var valida = true;
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var emails = $("#email").val().trim().split(";");

    emails.forEach(email => {
        if (valida == true && !re.test(email.trim())) {
            valida = false;
        }
    });

    if (!valida) {
        FLUIGC.toast({
            message: "E-mails em cópia inválido!",
            type: "warning"
        });
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#email").offset().top - (screen.height * 0.15)
        }, 700);
        $("#email").addClass("has-error");
    }

    return valida;
}

function BuscaColigadas() {
    DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
        DatasetFactory.createConstraint("operacao", "BuscaColigadas", "BuscaColigadas", ConstraintType.MUST),
        DatasetFactory.createConstraint("usuario", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST)
    ], null, {
        success: (coligadas => {
            var optSelected1 = $("#coligadaExclusaoLancamento").val();
            var optSelected2 = $("#coligadaDevolucaoDeCompra").val();

            $("#coligadaExclusaoLancamento").html("<option></option>");
            $("#coligadaDevolucaoDeCompra").html("<option></option>");
            coligadas.values.forEach(coligada => {
                $("#coligadaExclusaoLancamento").append("<option value='" + coligada.CODCOLIGADA + "'>" + coligada.CODCOLIGADA + " - " + coligada.NOMEFANTASIA + "</option>");
                $("#coligadaDevolucaoDeCompra").append("<option value='" + coligada.CODCOLIGADA + "'>" + coligada.CODCOLIGADA + " - " + coligada.NOMEFANTASIA + "</option>");
            });

            $("#coligadaExclusaoLancamento").val(optSelected1);
            $("#coligadaDevolucaoDeCompra").val(optSelected2);
        }),
        error: (error => {
            FLUIGC.toast({
                title: "Erro ao buscar coligadas",
                message: error,
                type: "warning"
            });
        }),
    });
}

function BuscaMovimento(CODCOLIGADA, IDMOV) {
    DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
        DatasetFactory.createConstraint("operacao", "BuscaMovimento", "BuscaMovimentos", ConstraintType.MUST),
        DatasetFactory.createConstraint("codcoligada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("idmov", IDMOV, IDMOV, ConstraintType.MUST)
    ], null, {
        success: (movimento => {
            if (movimento.values.length > 0) {
                if (movimento.values[0].CODTMV == "1.1.98" || movimento.values[0].CODTMV == "1.1.99") {
                    FLUIGC.toast({
                        title: "Cancelamento de movimentos do tipo 1.1.98 ou 1.1.99 devem ser solicitados para a Controladoria!",
                        message: "",
                        type: "warning"
                    });
                    $("#movimentoExclusaoLancamento").val("");
                }
                else if (["1.1.02", "1.2.01", "1.2.24", "1.1.07", "1.2.05", "1.2.22", "1.2.06", "1.2.13", "1.2.14", "1.1.03", "1.2.07", "1.2.08", "1.2.10"].includes(movimento.values[0].CODTMV)) {
                    $("#spanColigadaExclusaoMovimento").text(movimento.values[0].CODCOLIGADA + " - " + movimento.values[0].COLIGADA);
                    $("#spanMovimentoExclusaoMovimento").text(movimento.values[0].IDMOV);
                    $("#spanFilialExclusaoMovimento").text(movimento.values[0].CODFILIAL + " - " + movimento.values[0].FILIAL);
                    $("#spanFornecedorExclusaoMovimento").text(movimento.values[0].FORNECEDOR);
                    $("#spanCGCCFOExclusaoMovimento").text(movimento.values[0].CGCCFO);
                    $("#spanCODTMVExclusaoMovimento").text(movimento.values[0].CODTMV);
                    $("#spanValorExclusaoMovimento").text(FormataValor(movimento.values[0].VALOR));
                    $("#spanDataEmissaoExclusaoMovimento").text(FormataDataParaDD_MM_AAAA(movimento.values[0].DATAEMISSAO));
                    $("#spanNumMovimentoExclusaoMovimento").text(movimento.values[0].NUMEROMOV);
                    $("#jsonMovimentoExclusao").val(JSON.stringify(movimento.values[0]));


                    if (movimento.values[0].CODTMV == "1.2.01" || movimento.values[0].CODTMV == '1.2.05' || movimento.values[0].CODTMV == "1.2.22" || movimento.values[0].CODTMV == "1.2.07" || movimento.values[0].CODTMV == "1.2.08") {
                        $("#checkboxCancelarMovOrigem").closest(".row").show();
                        $("#checkboxCancelarMovOrigem").on("change", function () {
                            if ($(this).is(":checked")) {
                                BuscaMovimentoOrigem($("#coligadaExclusaoLancamento").val(), $("#movimentoExclusaoLancamento").val());
                            }
                            else {
                                $("#divInfoExclusaoLancamentoOrigem").html("");
                            }
                        });
                    } else {
                        $("#checkboxCancelarMovOrigem").closest(".row").hide();
                        $("#checkboxCancelarMovOrigem").prop("checked", false);
                    }
                }
                else {
                    FLUIGC.toast({
                        title: "Tipo de movimento desconhecido!",
                        type: "warning"
                    });
                    $("#movimentoExclusaoLancamento").val("");
                }
            }
            else {
                if ($("#jsonMovimentoExclusao").val() == "" || $("#jsonMovimentoExclusao").val() == null) {
                    FLUIGC.toast({
                        title: "Nenhum movimento encontrado!",
                        type: "warning"
                    });
                }
                else {
                    var json = JSON.parse($("#jsonMovimentoExclusao").val());

                    $("#spanColigadaExclusaoMovimento").text(json.CODCOLIGADA + " - " + json.NOMEFANTASIA);
                    $("#spanMovimentoExclusaoMovimento").text(json.IDMOV);
                    $("#spanFilialExclusaoMovimento").text(json.CODFILIAL + " - " + json.FILIAL);
                    $("#spanFornecedorExclusaoMovimento").text(json.FORNECEDOR);
                    $("#spanCGCCFOExclusaoMovimento").text(json.CGCCFO);
                    $("#spanCODTMVExclusaoMovimento").text(json.CODTMV);
                    $("#spanValorExclusaoMovimento").text(FormataValor(json.VALOR));
                    $("#spanDataEmissaoExclusaoMovimento").text(FormataDataParaDD_MM_AAAA(json.DATAEMISSAO));
                    $("#spanNumMovimentoExclusaoMovimento").text(json.NUMEROMOV);
                }
            }
        }),
        error: (error => {
            FLUIGC.toast({
                title: "Erro ao busca movimento: ",
                message: error,
                type: "warning"
            });
        })
    });
}

function BuscaMovimentoDevolucaoDeCompras(CODCOLIGADA, IDMOV) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
            DatasetFactory.createConstraint("operacao", "BuscaMovimento", "BuscaMovimentos", ConstraintType.MUST),
            DatasetFactory.createConstraint("codcoligada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
            DatasetFactory.createConstraint("idmov", IDMOV, IDMOV, ConstraintType.MUST)
        ], null, {
            success: (movimento => {
                console.log(movimento)
                if (movimento.values.length > 0) {
                    if (movimento.values[0].coluna == "deu erro! ") {
                        FLUIGC.toast({
                            message: "Erro ao buscar Movimento",
                            type: "warning"
                        });
                        console.error(movimento.values);
                        reject();
                    } else {
                        resolve(movimento.values[0]);
                    }
                }
                else {
                    FLUIGC.toast({
                        title: "Erro ao buscar Movimento: ",
                        message: "Nenhum movimento encontrado",
                        type: "warning"
                    });
                    console.error(movimento);
                    reject();
                }
            }),
            error: (error => {
                console.log(error);
                FLUIGC.toast({
                    title: "Erro ao buscar Movimento: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        })
    });
}

function BuscaMovimentoOrigem(CODCOLIGADA, IDMOV) {
    DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
        DatasetFactory.createConstraint("operacao", "BuscaMovimentoOrigem", "BuscaMovimentoOrigem", ConstraintType.MUST),
        DatasetFactory.createConstraint("codcoligada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("idmov", IDMOV, IDMOV, ConstraintType.MUST)
    ], null, {
        success: (movimento => {
            console.log(movimento);
            if (movimento.values.length > 0) {
                var html =
                    "<br>\
                <div class='panel panel-primary'>\
                    <div class='panel-heading'>\
                        <h3 class='panel-title'>Movimento de Origem para Exclusão</h3>\
                    </div>\
                    <div class='panel-body'>\
                        <div class='row'>\
                            <div class='col-md-4'>\
                                <b>Coligada: </b><span>" + movimento.values[0].CODCOLIGADA + " - " + movimento.values[0].COLIGADA + "</span>\
                                <br><br>\
                            </div>\
                            <div class='col-md-4'>\
                                <b>Movimento: </b><span>" + movimento.values[0].IDMOV + "</span>\
                                <br><br>\
                            </div>\
                            <div class='col-md-4'>\
                                <b>Filial: </b><span>" + movimento.values[0].CODFILIAL + " - " + movimento.values[0].FILIAL + "</span>\
                                <br><br>\
                            </div>\
                        </div>\
                        <div class='row'>\
                            <div class='col-md-4'>\
                                <b>Fornecedor: </b><span>" + movimento.values[0].FORNECEDOR + "</span>\
                                <br><br>\
                            </div>\
                            <div class='col-md-4'>\
                                <b>CPF/CNPJ: </b><span>" + movimento.values[0].CGCCFO + "</span>\
                                <br><br>\
                            </div>\
                            <div class='col-md-4'>\
                                <b>Tipo de movimento: </b><span>" + movimento.values[0].CODTMV + "</span>\
                                <br><br>\
                            </div>\
                        </div>\
                        <div class='row'>\
                            <div class='col-md-4'>\
                                <b>Valor: </b><span>" + FormataValor(movimento.values[0].VALOR) + "</span>\
                                <br><br>\
                            </div>\
                            <div class='col-md-4'>\
                                <b>Data de Emissão: </b><span>" + FormataDataParaDD_MM_AAAA(movimento.values[0].DATAEMISSAO) + "</span>\
                                <br><br>\
                            </div>\
                            <div class='col-md-4'>\
                                <b>Nº do movimento: </b><span>" + movimento.values[0].NUMEROMOV + "</span>\
                                <br><br>\
                            </div>\
                        </div>\
                    <div>\
                </div>";
                $("#jsonMovimentoOrigemExclusao").val(JSON.stringify(movimento.values[0]));
                $("#divInfoExclusaoLancamentoOrigem").html(html);
            }
            else {
                if ($("#jsonMovimentoOrigemExclusao").val() == "" || $("#jsonMovimentoOrigemExclusao").val() == null) {
                    FLUIGC.toast({
                        title: "Nenhum movimento encontrado!",
                        type: "warning"
                    });
                }
                else {
                    var json = JSON.parse($("#jsonMovimentoOrigemExclusao").val());
                    var html =
                        "<br>\
                    <div class='panel panel-primary'>\
                        <div class='panel-heading'>\
                            <h3 class='panel-title'>Movimento de Origem para Exclusão</h3>\
                        </div>\
                        <div class='panel-body'>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Coligada: </b><span>" + json.CODCOLIGADA + " - " + json.NOMEFANTASIA + "</span>\
                                    <br><br>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Movimento: </b><span>" + json.IDMOV + "</span>\
                                    <br><br>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Filial: </b><span>" + json.CODFILIAL + " - " + json.FILIAL + "</span>\
                                    <br><br>\
                                </div>\
                            </div>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Fornecedor: </b><span>" + json.FORNECEDOR + "</span>\
                                    <br><br>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>CPF/CNPJ: </b><span>" + json.CGCCFO + "</span>\
                                    <br><br>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Tipo de movimento: </b><span>" + json.CODTMV + "</span>\
                                    <br><br>\
                                </div>\
                            </div>\
                            <div class='row'>\
                                <div class='col-md-4'>\
                                    <b>Valor: </b><span>" + FormataValor(json.VALOR) + "</span>\
                                    <br><br>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Data de Emissão: </b><span>" + FormataDataParaDD_MM_AAAA(json.DATAEMISSAO) + "</span>\
                                    <br><br>\
                                </div>\
                                <div class='col-md-4'>\
                                    <b>Nº do movimento: </b><span>" + json.NUMEROMOV + "</span>\
                                    <br><br>\
                                </div>\
                            </div>\
                        <div>\
                    </div>";

                    $("#divInfoExclusaoLancamentoOrigem").html(html);
                }
            }
        }),
        error: (error => {
            FLUIGC.toast({
                title: "Erro ao busca movimento: ",
                message: error,
                type: "warning"
            });
        })
    });
}

function FormataValor(valor) {
    valor = parseFloat(valor);
    return valor.toLocaleString("pt-br", { style: "currency", currency: "BRL" });
}

function FormataDataParaDD_MM_AAAA(data) {
    data = data.split(" ")[0].split("-");
    return data[2] + "/" + data[1] + "/" + data[0];
}

function CriaDocFluig(idInput, i = 0) {
    var files = $("#" + idInput)[0].files;
    var reader = new FileReader();
    var fileName = "";
    fileName = files[i].name;

    reader.onload = function (e) {
        var bytes = e.target.result.split("base64,")[1];
        DatasetFactory.getDataset("CriacaoDocumentosFluig", null, [
            DatasetFactory.createConstraint("processo", $("#numProcess").val(), $("#numProcess").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("idRM", "Teste", "Teste", ConstraintType.MUST),
            DatasetFactory.createConstraint("conteudo", bytes, bytes, ConstraintType.MUST),
            DatasetFactory.createConstraint("nome", fileName, fileName, ConstraintType.SHOULD),
            DatasetFactory.createConstraint("descricao", fileName, fileName, ConstraintType.SHOULD),
            DatasetFactory.createConstraint("pasta", 140518, 140518, ConstraintType.SHOULD), //Prod
            //DatasetFactory.createConstraint("pasta", 26834, 26834, ConstraintType.SHOULD) //Homolog
        ], null, {
            success: function (dataset) {
                if (!dataset || dataset == "" || dataset == null) {
                    throw "Houve um erro na comunicação com o webservice de criação de documentos. Tente novamente!";
                } else {
                    if (dataset.values[0][0] == "false") {
                        throw "Erro ao criar arquivo. Favor entrar em contato com o administrador do sistema. Mensagem: " + dataset.values[0][1];
                    } else {
                        console.log("### GEROU docID = " + dataset.values[0].Resultado);


                        if (idInput == "myFile") {//Se o documento que está sendo anexado seja o contrato
                            $("#idDocContrato").val(dataset.values[0].Resultado);
                            ValidaTerminoTabContrato(true);
                        } else if ($("#idDoc" + idInput.split("inputFile")[1]).val() == null || $("#idDoc" + idInput.split("inputFile")[1]).val() == "") {//Se esta sendo anexado somente um documento
                            $("#idDoc" + idInput.split("inputFile")[1]).val(dataset.values[0].Resultado);
                        } else {//Se mais de um documento esta sendo anexado concatena no input os IDs dos documentos
                            $("#idDoc" + idInput.split("inputFile")[1]).val($("#idDoc" + idInput.split("inputFile")[1]).val() + "," + dataset.values[0].Resultado);
                        }

                        if (files.length > i + 1) {//Se tem mais documentos para anexar chama a funcao novamente passando o proximo documento
                            dataset.values[0].Resultado += "," + CriaDocFluig(idInput, i + 1);
                        }
                        else {
                            if (i > 0) {
                                $("#" + idInput)
                                    .siblings("div")
                                    .html((i + 1) + " Documentos");
                            } else {
                                $("#" + idInput).siblings("div").html(fileName);
                            }
                        }
                    }
                }
            },
            error: function (error) {
                console.log("Erro ao criar documento no Fluig: " + error);
                $(this).siblings("div").html("Nenhum arquivo selecionado");
                throw error;
            }
        });
    };
    reader.readAsDataURL(files[i]);
}

function BuscaCentroDeCusto(permissaoGeral = false) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("colleagueGroup", null, [
            DatasetFactory.createConstraint("groupId", "SuporteContabilidade", "SuporteContabilidade", ConstraintType.SHOULD),
            DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD),
            DatasetFactory.createConstraint("colleagueId", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST)
        ], null, {
            success: (grupos => {
                var constraints = [
                    DatasetFactory.createConstraint("usuario", $("#solicitante").val(), $("#solicitante").val(), ConstraintType.MUST)
                ];
                if (grupos.values.length > 0 || permissaoGeral === true) {
                    constraints.push(
                        DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST)
                    )
                }
                DatasetFactory.getDataset("BuscaPermissaoColigadasUsuario", null, constraints, null, {
                    success: (CentrosDeCusto => {
                        if (CentrosDeCusto.values.length > 0) {
                            var options = "";
                            var codcoligada = "";
                            CentrosDeCusto.values.forEach(ccusto => {
                                if ($("#categoria").val() == 'Transferencia de Imobilizado') {
                                    if (ccusto.CODCOLIGADA == '1') {
                                        if (codcoligada != ccusto.CODCOLIGADA){
                                            codcoligada = ccusto.CODCOLIGADA;
                                            options += "<optgroup label='" + ccusto.CODCOLIGADA + " - " + ccusto.NOMEFANTASIA + "'>";
                                        }
                                        options += "<option value='" + ccusto.CODCOLIGADA + " - " + ccusto.CODCCUSTO + " - " + ccusto.perfil + "'>" + ccusto.CODCCUSTO + " - " + ccusto.perfil + "</option>";
                                    }
                                }
                                else{
                                    if (codcoligada != ccusto.CODCOLIGADA) {
                                        if (codcoligada != "") {
                                            options += "</optgroup>";
                                        }
                                        options +=
                                            "<optgroup label='" + ccusto.CODCOLIGADA + " - " + ccusto.NOMEFANTASIA + "'>";
                                        codcoligada = ccusto.CODCOLIGADA;
                                    }
    
                                    options += "<option value='" + ccusto.CODCOLIGADA + " - " + ccusto.CODCCUSTO + " - " + ccusto.perfil + "'>" + ccusto.CODCCUSTO + " - " + ccusto.perfil + "</option>";
                                }
                             });
                            options += "</optgroup>";

                            resolve(options);
                        }
                        else {
                            DatasetFactory.getDataset("colleagueGroup", null, [
                                DatasetFactory.createConstraint("colleagueId", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST),
                                DatasetFactory.createConstraint("groupId", "Obra", "Obra", ConstraintType.MUST, true),
                            ], null, {
                                success: (ds => {
                                    var options = "";
                                    ds.values.forEach(obra => {
                                        var ds2 = DatasetFactory.getDataset("GCCUSTO", null, [
                                            DatasetFactory.createConstraint("NOME", obra["colleagueGroupPK.groupId"], obra["colleagueGroupPK.groupId"], ConstraintType.MUST)
                                        ], null);
                                        var ccusto = ds2.values[0];

                                        options += "<option value='" + ccusto.CODCOLIGADA + " - " + ccusto.CODCCUSTO + " - " + ccusto.NOME + "'>" + ccusto.CODCCUSTO + " - " + ccusto.NOME + "</option>";
                                    });
                                    resolve(options);
                                }),
                                error: (error => {
                                    FLUIGC.toast({
                                        title: "Erro ao buscar obras: ",
                                        message: error,
                                        type: "warning"
                                    });
                                })
                            });
                        }

                    }),
                    error: (error => {
                        FLUIGC.toast({
                            title: "Erro ao buscar Centros de Custo: ",
                            message: error,
                            type: "warning"
                        });
                    })
                });
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao verificar permissões do usuário",
                    message: error,
                    type: "warning"
                });
            })
        });
    });
}

function BuscaDepartamentos() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DepartamentosRM", null, [
            DatasetFactory.createConstraint("codcoligada", 1, 1, ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", 1, 1, ConstraintType.MUST)
        ], null, {
            success: (departamentos => {
                var options = "<option></option>";
                departamentos.values.forEach(departamento => {
                    options +=
                        "<option value='" + departamento.coddepartamento + " - " + departamento.nome + "'>" + departamento.coddepartamento + " - " + departamento.nome + "</option>";
                });

                resolve(options);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar departamentos: ",
                    message: error,
                    type: "warning"
                });
            })
        })
    });
}

function BuscaFornecedor(cgccfo) {
    DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
        DatasetFactory.createConstraint("operacao", "BuscaFornecedor", "BuscaFornecedor", ConstraintType.MUST),
        DatasetFactory.createConstraint("cgccfo", cgccfo, cgccfo, ConstraintType.MUST)
    ], null, {
        success: (transportadora => {



        }),
        error: (error => {
            FLUIGC.toast({
                title: "Erro ao buscar fornecedor: ",
                message: error,
                type: "warning"
            });
        })
    });
}

function BuscaTransportadora() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
            DatasetFactory.createConstraint("operacao", "BuscaTransportadora", "BuscaTransportadora", ConstraintType.MUST),
        ], null, {
            success: (transportadoras => {
                if (transportadoras.values.length < 1) {
                    FLUIGC.toast({
                        message: "Erro ao buscar transportadoras",
                        type: "warning"
                    });
                    reject();
                }
                else {
                    if (transportadoras.values[0].CGC != null && transportadoras.values[0].CGC != "" && transportadoras.values[0].CGC != undefined) {
                        resolve(transportadoras);
                    }
                    else {
                        FLUIGC.toast({
                            message: "Erro ao buscar transportadoras",
                            type: "warning"
                        });
                        console.error(transportadoras);
                        reject();
                    }
                }
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar transportadoras: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaItensDaOC(COLIGADA, IDMOV) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
            DatasetFactory.createConstraint("operacao", "BuscaItensMovimento", "BuscaItensMovimento", ConstraintType.MUST),
            DatasetFactory.createConstraint("codcoligada", COLIGADA, COLIGADA, ConstraintType.MUST),
            DatasetFactory.createConstraint("idmov", IDMOV, IDMOV, ConstraintType.MUST)
        ], null, {
            success: (itens => {
                if (itens.values.length > 0) {
                    if (itens.values[0].coluna == "deu erro! ") {
                        console.error(itens.values)
                        reject();
                    } else {
                        resolve(itens.values);
                    }
                }
                else {
                    FLUIGC.toast({
                        title: "Erro ao buscar itens da OC: ",
                        message: "Nenhum movimento encontrado",
                        type: "warning"
                    });
                    console.error(itens);
                    reject();
                }
            }),
            error: (error => {
                console.log(error);
                FLUIGC.toast({
                    title: "Erro ao buscar itens da OC: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        })
    });
}

function SalvaItensDevolucaoCompras() {
    var json = []
    $("#tableItensDevolucaoDeCompra tbody").find("tr").each(function () {
        if ($(this).find(".checkboxSelectItemDevolucaoDeCompra").is(":checked")) {
            json.push({
                produto: $(this).find("td:eq(1)").text(),
                descricao: $(this).find("td:eq(2)").text(),
                quantidade: $(this).find("td:eq(3)").text(),
                valorUnit: $(this).find("td:eq(4)").find("span").text(),
                valorTotal: $(this).find("td:eq(5)").text(),
                qntDevolvida: $(this).find("td:eq(6)").find("input").val()
            });
        }
    });
    $("#jsonItensDevolucaoCompras").val(JSON.stringify(json));
}

function GeraItensDevolucaoCompras() {
    $("#tableItensDevolucaoDeCompra thead").find("th:first").remove();

    var json = JSON.parse($("#jsonItensDevolucaoCompras").val());
    var html = "";
    for (var i = 0; i < json.length; i++) {
        html +=
            "<tr>\
            <td>\
                " + json[i].produto + "\
            </td>\
            <td>\
                " + json[i].descricao + "\
            </td>\
            <td>\
                " + json[i].quantidade + "\
            </td>\
            <td>\
                " + json[i].valorUnit + "\
            </td>\
            <td>\
                " + json[i].valorTotal + "\
            </td>\
            <td>\
                " + json[i].qntDevolvida + "\
            </td>\
            <td>\
                R$ " + parseFloat(json[i].valorUnit.trim().split("R$")[1].split(".").join("").replace(",", ".") * json[i].qntDevolvida.split(" ")[0]).toLocaleString("pt-br", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + "\
            </td>\
        </tr>";
    }

    $("#tableItensDevolucaoDeCompra tbody").append(html);
}

function BuscaContrato() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSuporteContabilidade", null, [
            DatasetFactory.createConstraint("operacao", "BuscaContrato", "BuscaContrato", ConstraintType.MUST),
            DatasetFactory.createConstraint("codigocontrato", $("#NContratoEntradaDeEquipamentos").val(), $("#NContratoEntradaDeEquipamentos").val(), ConstraintType.MUST)
        ], null, {
            success: (retorno => {
                if (retorno.values.length > 0) {
                    if (retorno.values[0].coluna == "deu erro! ") {
                        console.error(retorno.values);
                        reject()
                    } else {
                        resolve(retorno.values);
                    }
                }
                else {
                    FLUIGC.toast({
                        title: "Erro ao buscar contrato: ",
                        message: "Nenhum contrato encontrado",
                        type: "warning"
                    });
                    console.error(retorno);
                    reject();
                }
            }),
            error: (error => {
                console.log(error);
                FLUIGC.toast({
                    title: "Erro ao buscar contrato: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function InsereRowTableTransfImob(){
    var id = Date.now();
    $("#bodyTableTransferenciaImoblizados").append('\
        <tr class="trTableTransferenciaImoblizados">\
            <td>\
                <input type="text" class="InputImobilizado DescItemImob form-control" id="DescItemImob" />\
            </td>\
            <td>\
                <input type="text" class="PrefixItemImob form-control" />\
            </td>\
            <td>\
                <input type="number" class="InputImobilizado QuantItemImob form-control" id="QuantItemImob" />\
            </td>\
            <td>\
                <input type="text" placeholder="R$ ###,##" class="InputImobilizado ValorItemImob form-control"  id="ValorItemImob" />\
            </td>\
            <td style="text-align: center;">\
                <button id="botaoRemoverItemImobilizado_' + id + '" class="botaoRemoverItemImobilizado btn btn-danger">\
                    <i class="flaticon flaticon-trash icon-md" style="/* padding-left: 3%; */">\
                    </i>\
                </button>\
            </td>\
        </tr>\
    ')
    
    $(".botaoRemoverItemImobilizado:last").on('click', function() {
        var  ReotrnoConfirmo = confirm("Deseja confirmar a remoção deste Item?");
        if (ReotrnoConfirmo == true) {
            $(this).closest('.trTableTransferenciaImoblizados').remove();
        }
        else{
            false
        }
        
       
    });
}

function InsereItensNaTableImob(){
    var atividade = $("#atividade").val() 
    var ItensImobilizado = $("#jsonItensImobilizado").val();
    ItensImobilizado = JSON.parse(ItensImobilizado);

    if (atividade == '5') {
        for (i = 0; i < ItensImobilizado.length; i++) {
            $("#bodyTableTransferenciaImoblizados").append('\
            <tr class="trTableTransferenciaImoblizados">\
                <td>\
                    <span>' + ItensImobilizado[i].DescricaoImob + '</span>\
                </td>\
                <td>\
                    <span>' + ItensImobilizado[i].PrefixoImob + '</span>\
                </td>\
                <td>\
                    <span>' + ItensImobilizado[i].QuantidadeImob + '</span>\
                </td>\
                <td>\
                    <span>' + ItensImobilizado[i].ValorImob + '</span>\
                </td>\
            </tr>\
        ')
        }
    }
    else if (atividade == 4) {
        for (i = 0; i < ItensImobilizado.length; i++) {
            $("#bodyTableTransferenciaImoblizados").append('\
            <tr class="trTableTransferenciaImoblizados">\
                <td>\
                    <input type="text" class="InputImobilizado DescItemImob form-control" value='+ ItensImobilizado[i].DescricaoImob +' />\
                </td>\
                <td>\
                    <input type="text" class="PrefixItemImob form-control" value=' + ItensImobilizado[i].PrefixoImob +' />\
                </td>\
                <td>\
                    <input type="number" class="InputImobilizado QuantItemImob form-control" value=' + ItensImobilizado[i].QuantidadeImob +' />\
                </td>\
                <td>\
                    <input type="text" class="InputImobilizado ValorItemImob form-control" value=' + ItensImobilizado[i].ValorImob +' />\
                </td>\
            </tr>\
        ')   
        }
    }
}