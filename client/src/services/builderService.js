import api from "./api";

/*
==============================================================
                  PIZZA BUILDER SERVICE
==============================================================

Connects the React pizza builder to the existing backend.

Backend endpoints:

GET  /api/builder/bases
GET  /api/builder/sauces
GET  /api/builder/cheeses
GET  /api/builder/vegetables
POST /api/builder/build
==============================================================
*/

export const getPizzaBases = async () => {
  const response = await api.get("/builder/bases");

  return response.data;
};

export const getSauces = async () => {
  const response = await api.get("/builder/sauces");

  return response.data;
};

export const getCheeses = async () => {
  const response = await api.get("/builder/cheeses");

  return response.data;
};

export const getVegetables = async () => {
  const response = await api.get("/builder/vegetables");

  return response.data;
};

export const buildCustomPizza = async ({
  baseId,
  sauceId,
  cheeseId,
  vegetableIds,
}) => {
  const response = await api.post("/builder/build", {
    baseId,
    sauceId,
    cheeseId,
    vegetableIds,
  });

  return response.data;
};
