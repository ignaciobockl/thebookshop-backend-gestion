// const { response } = require("express");
// const mercadopago = require('mercadopago');



// const CreatePreference = async( req, res = response ) => {

//     let preference = {
// 		items: [
// 			{
// 				title: req.body.description,
// 				unit_price: Number(req.body.price),
// 				quantity: Number(req.body.quantity),
// 			}
// 		],
// 		back_urls: {
// 			"success": "http://localhost:8080/feedback",
// 			"failure": "http://localhost:8080/feedback",
// 			"pending": "http://localhost:8080/feedback"
// 		},
// 		auto_return: "approved",
// 	};

// 	mercadopago.preferences.create(preference)
// 		.then(function (response) {
// 			res.json({
// 				id: response.body.id
// 			});
// 		}).catch(function (error) {
// 			console.log(error);
// 		});
// }

// const Feedback = (req, res) => {

// 	res.json({
// 		Payment: req.query.payment_id,
// 		Status: req.query.status,
// 		MerchantOrder: req.query.merchant_order_id
// 	});

// }



// module.exports = {
//     CreatePreference, 
// 	Feedback
// }