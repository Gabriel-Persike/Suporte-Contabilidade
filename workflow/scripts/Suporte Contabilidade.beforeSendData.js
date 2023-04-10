function beforeSendData(customField, customFact) {

    customField[0] = hAPI.getCardValue("data_ocorrencia");

    customField[1] = hAPI.getCardValue("categoria");

    customField[2] = hAPI.getCardValue("prioridade");

    customField[3] = hAPI.getCardValue("problema");

    customField[4] = hAPI.getCardValue("solucao");

    customField[5] = hAPI.getCardValue("usuario");
}
