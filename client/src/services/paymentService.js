import api from "./api";

/*
==============================================================
                    PAYMENT SERVICE
==============================================================

Handles the existing Razorpay-style test payment flow.
==============================================================
*/

export const createTestPaymentSession = async (orderId) => {
  const response = await api.post(`/payments/test/${orderId}`);

  return response.data;
};

export const completeTestPayment = async ({
  orderId,
  testPaymentOrderId,
  result,
}) => {
  const response = await api.post("/payments/test/complete", {
    orderId,
    testPaymentOrderId,
    result,
  });

  return response.data;
};
