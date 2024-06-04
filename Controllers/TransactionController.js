const express = require("express");
const paypalConfig = require("../Config/paypal");
const paypal = require("paypal-rest-sdk");
var fetch = require("node-fetch");
const User = require("../Models/User");


paypal.configure(paypalConfig);

const json_payment = {
  items: [
    {
      receiver: "receiver@example.com",
      amount: {
        currency: "USD",
        value: "9.87",
      },
      recipient_type: "EMAIL",
      note: "Thanks for your patronage!",
      sender_item_id: "201403140001",
      recipient_wallet: "RECIPIENT_SELECTED",
    },
  ],
  sender_batch_header: {
    sender_batch_id: "Payouts_2020_100007",
    email_subject: "You have a payout!",
    email_message: "You have received a payout! Thanks for using our service!",
  },
};

// quantidade de video assistidos (anuncios/videos), data de ultimo saque,
// pagamento e pagamento bonus porque assim já fica relacionado ao usuário
window.cacheDolar = 0; //valor disponivel para usuário em dolar
window.valueDolar = 0; //valor atual do dolar
window.amountTotal = 0; //valor total

// #region Fazendo a requisição para saber o valor atual do dolar
// URL da API de cambio
const urlCambio = "https://api.exchangeratesapi.io/latest?symbols=USD";

fetch(urlCambio)
  .then((response) => response.json())
  .then((data) => {
    // Valor do dólar em relação à moeda base (EUR no caso da API padrão)
    window.valueDolar = data.rates.USD;
    console.log(`Valor atual do dólar: ${this.valueDolar}`);
  })
  .catch((error) => {
    console.error("Erro ao obter o valor do dólar:", error);
  });

//retirar taxa do valor do dolar (Real valor do dolar utilizado para converter)
window.valueDolar = window.valueDolar - window.valueDolar * 0.18;

//#endregion

//#region calculos saldo
//bancos que serão cobrado uma taxa de 5,8% para fazer transferencia
const banks = [
  "Crefisa",
  "Banco do Brasil",
  "Itaú",
  "Sicoob",
  "PicPay/Original",
  "C6Bank",
  "Bradesco",
  "BV",
  "BMG Pactual",
  "Banrisul",
  "Nubank",
  "PagBank (PagSeguro)",
];

//calculo de pagamento para quem assiste videos
const paymentViwers = async (qtyVideo, qtyAd) => {
  try {
    //#region calculo de pagamento bonus para telespectadores
    if (qtyAd == 45000) {
      window.cacheDolar = window.cacheDolar + 185.5;
    }
    //#endregion

    //#region calculo de pagamento para telespectadores
    if (qtyVideo == 1500 && qtyAd == 1250) {
      window.cacheDolar = window.cacheDolar + 67.87; //Valor em dolares
    } else if (qtyVideo > 1500 && qtyAd > 1250) {
      do {
        qtyVideo = qtyVideo - 1500;
        qtyAd = qtyAd - 1250;
        window.cacheDolar = window.cacheDolar + 67.87; //Valor em dolares
      } while (qtyVideo > 1500 && qtyAd > 1250);
    }
    //#endregion

    return window.cacheDolar; //Valor em dolares
  } finally {
    console.log(`Pagamento já disponível`);
  }
};

//calculo de pagamento para quem publica
const paymentVideoCreator = async (qtyViews, qtyVideoPublic) => {
  //basicamente é um valor de (0,0033 por pessoa que vê o video)
  //precisa ser visto se o pagamento será feito por view ou só a partir
  //de 1000 views
  try {
    //#region calculo de pagamento  bonus para quem publica
    if (qtyVideoPublic == 1000) {
      window.cacheDolar = window.cacheDolar + 295.6;
    }
    //#endregion

    //#region calculo de pagamento para quem publica
    if (qtyViews == 1000) {
      window.cacheDolar = window.cacheDolar + 3.3; //valor em dólar
    } else if (qtyViews > 1000) {
      do {
        qtyViews - 1000;
        window.cacheDolar = window.cacheDolar + 3.3;
      } while (qtyViews > 1000);
    }
    //#endregion

    //valor em dolar disponivel para o usuário
    return window.cacheDolar;
  } finally {
    console.log(`Pagamento já disponível`);
  }
};

// saque de pagamento
// no saque será preciso informar qual das duas opçoes de saque
// o usuário escolheu, tem duas taxas possiveis
// valor de 1x com taxa de 19,5%
// valor de 2x com taxa de 8,9%, dentro de 15 dias
const withdrawal = async (req, res) => {
  try {
    //#region variáveis de controle
    const {
      option, //qual opção de saque ele escolheu
      amountWithdrawal, //valor solicitado para saque saque
      amountAvailableWithdrawal, //valor disponivel para saque
      userNative, //se o usuário é nativo
      bank, //nome do banco do usuário
    } = req.body;
    const userId = req.body.userId; //id do usuário
    const email = req.body.email; //email do usuário
    amountWithdrawal1 = 0; //valor parcela de saque 1
    amountWithdrawal2 = 0; //valor parcela de saque 2
    const dateWithdrawal1 = new Date(); //data de solicitação do saque
    const dateWithdrawal2 = dateWithdrawal1.setDate(
      dateWithdrawal1.getDate() + 15
    ); //data de solicitação do segundo saque
    //#endregion

    //#region remove taxa banco 5,8%
    let bankPay = banks.includes(bank);
    if (bankPay == true) {
      amountWithdrawal = amountWithdrawal * 0.058;
    }
    //#endregion

    //#region chamada de calculo do valor de saque a depender da opção e se o usuário é nativo ou não
    if (option == 1) {
      if (userNative == true) {
        userNativeOption1(amountAvailableWithdrawal, amountWithdrawal);
      } else if (userNative == false) {
        userNoNativeOption1(amountAvailableWithdrawal, amountWithdrawal);
      }
    } else if (option == 2) {
      if (userNative == true) {
        userNativeOption2(amountAvailableWithdrawal, amountWithdrawal);
      } else if (userNative == false) {
        userNoNativeOption2(amountAvailableWithdrawal, amountWithdrawal);
      }

      //definindo valor das parcelas
      amountWithdrawal1 = window.amountTotal / 2;
      amountWithdrawal2 = window.amountTotal / 2;
    }
    //#endregion

    //#region remover valor do saldo do usuário
    amountAvailableWithdrawal = amountAvailableWithdrawal - window.amountTotal;
    await removeValueUser(amountAvailableWithdrawal, userId);
    //#endregion

    //#region salvar dados parcelas pagamento no usuário
    const valueTotal = window.amountTotal;
    const update = {
      amountWithdrawal1,
      amountWithdrawal2,
      amountAvailableWithdrawal,
      dateWithdrawal1,
      dateWithdrawal2,
    };
    await savePayment(update, userId, valueTotal);
    //#endregion

    //pagamento
    fetch("https://api-m.sandbox.paypal.com/v1/payments/payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer A101.OLQiCyqOpVwigKQQDu3CYlamZ1KTKQmhrbAZK85RIy4IiWh9d_up_lTadp_lfXdV.P3gvkY3PO28akjKYaDorm12QdfK",
      },
      body: JSON.stringify({
        sender_batch_header: 
        {
          email_subject: "You have a payout!",
          email_message: "You have received a payout!"
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: { value: amountWithdrawal1.toString(), currency: "BRL" },
            note: "Thanks!",
            receiver: email,
            recipient_wallet: "RECIPIENT_SELECTED",
          }, 
          {
            recipient_type: "EMAIL",
            amount: { value: amountWithdrawal2.toString(), currency: "BRL" },
            note: "Thanks!",
            receiver: email,
            recipient_wallet: "RECIPIENT_SELECTED",
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Erro ao efetuar pagamento do usuário:", error);
    throw error;
  }
};

//#region  calculos para valor final de saque
//precisa ser maior que 100 dolares para nativos e 250 para exterior

function userNativeOption1(amountAvailableWithdrawal, amountWithdrawal) {
  if (
    amountAvailableWithdrawal > 100 &&
    amountWithdrawal >= 100 &&
    amountAvailableWithdrawal > amountWithdrawal
  ) {
    //Taxa para saque
    window.amountTotal = amountWithdrawal - amountWithdrawal * 0.194;

    //taxa para converter para real (Retirada ainda no valor em dolar)
    window.amountTotal = amountTotal - amountTotal * 0.075;

    //definindo valor final para converter valor pra saque
    window.amountTotal = amountTotal * window.valueDolar;

    return window.amountTotal;
  }
}

function userNoNativeOption1(amountAvailableWithdrawal, amountWithdrawal) {
  if (
    amountAvailableWithdrawal > 250 &&
    amountWithdrawal >= 250 &&
    amountAvailableWithdrawal > amountWithdrawal
  ) {
    //Taxa para saque
    window.amountTotal = amountWithdrawal - amountWithdrawal * 0.194;

    //taxa para converter para real (Retirada ainda no valor em dolar)
    window.amountTotal = amountTotal - amountTotal * 0.075;

    //definindo valor final para converter valor pra saque
    window.amountTotal = amountTotal * window.valueDolar;

    return window.amountTotal;
  }
}

function userNativeOption2(amountAvailableWithdrawal, amountWithdrawal) {
  if (
    amountAvailableWithdrawal > 100 &&
    amountWithdrawal >= 100 &&
    amountAvailableWithdrawal > amountWithdrawal
  ) {
    //Taxa para saque parcelado
    window.amountTotal = amountWithdrawal - amountWithdrawal * 0.089;

    //taxa para converter para real (Retirada ainda no valor em dolar)
    window.amountTotal = amountTotal - amountTotal * 0.075;

    //definindo valor final para converter valor pra saque
    window.amountTotal = amountTotal * window.valueDolar;

    return window.amountTotal;
  }
}

function userNoNativeOption2(amountAvailableWithdrawal, amountWithdrawal) {
  if (
    amountAvailableWithdrawal > 250 &&
    amountWithdrawal >= 250 &&
    amountAvailableWithdrawal > amountWithdrawal
  ) {
    //Taxa para saque parcelado
    window.amountTotal = amountWithdrawal - amountWithdrawal * 0.089;

    //taxa para converter para real (Retirada ainda no valor em dolar)
    window.amountTotal = amountTotal - amountTotal * 0.075;

    //definindo valor final para converter valor pra saque
    window.amountTotal = amountTotal * window.valueDolar;

    return window.amountTotal;
  }
}
//#endregion

async function removeValueUser(amountAvailableWithdrawal, userId) {
  try {
    // Atualizar o perfil no banco de dados
    const updatedUser = await User.update(userId, {
      amountAvailableWithdrawal,
    });
  } catch (error) {
    console.error("Erro ao remover saldo do usuário:", error);
    throw error;
  }
}

async function savePayment(update, userId, valueTotal) {
  try {
    const {
      dateWithdrawal1,
      dateWithdrawal2,
      amountWithdrawal1,
      amountWithdrawal2,
      amountAvailableWithdrawal,
    } = update;

    const idPayment = generateGuid();

    // Atualizar o perfil no banco de dados
    const updatedUser = await User.update(userId, {
      amountWithdrawal1,
      amountWithdrawal2,
      amountAvailableWithdrawal,
      dateWithdrawal1,
      dateWithdrawal2,
      valueTotal,
      idPayment,
    });
  } catch (error) {
    console.error("Erro ao salvar dados das parcelas no usuário:", error);
    throw error;
  }
}

async function qtyVideoWatched(email){
  const user= await User.findByEmail(email);
  const userId = user.Id;
  const qtyVideoWatched = user.QtyVideo;

  const qtyVideo = qtyVideoWatched + 1;

  await User.update(userId, {
    qtyVideo
  });
}

async function qtyAdWatched(email){
  const user= await User.findByEmail(email);
  const userId = user.Id;
  const qtyAdWatched = user.QtyAd;

  const qtyAd = qtyAdWatched + 1;

  await User.update(userId, {
    qtyAd
  });
}
//#endregion

router.post("/", (req, res) => {});

function generateGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
