import express from "express";
import { mongoClient } from "./mongo.js";
import { ObjectId } from "mongodb";
import moment from "moment";
import cors from "cors";

const app = express();
await mongoClient.connect();
const db = mongoClient.db("db");

app.use(cors());
app.use(express.json());

app.listen(3333).on("listening", () => {
  console.log("listening to 3333");
});

app.get("/itens", async (req, res) => {
  try {
    const collection = db.collection("descartes");
    const data = await collection.find({}).toArray(function (err, result) {
      if (err) throw err;
      return result;
    });
    return res.status(200).json(data).status(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Erro Interno" });
  }
});

app.post("/itens", async (req, res) => {
  try {
    const body = req.body;
    const calcularDepreciacao = (precoInicial, dataCompra) => {
      const VIDA_UTIL_ANOS = 5;
      const hoje = new Date();
      const dataCompraDate = new Date(moment(dataCompra).format("YYYY-MM-DD"));
      const anosDesdeCompra = (hoje - dataCompraDate) / (1000 * 60 * 60 * 24 * 365.25);
      const depreciacaoAnual = precoInicial / VIDA_UTIL_ANOS;
      const depreciacaoTotal = depreciacaoAnual * anosDesdeCompra;
      const valorDepreciado = precoInicial - depreciacaoTotal;
      return valorDepreciado.toFixed(2);
    }
    const isDataValid = (data) => {
      return (
        data?.nome &&
        data?.preco &&
        data?.precoVenda &&
        data?.motivo &&
        data?.dataDescarte &&
        data?.dataCompra &&
        moment(data?.dataDescarte).format("YYYY-MM-DD") !== "Invalid date" &&
        moment(data?.dataCompra).format("YYYY-MM-DD") !== "Invalid date"
      );
    };
    const createPayload = (data) => {
      return {
        nome: data.nome,
        preco: parseFloat(data.preco),
        preco_venda: parseFloat(data.precoVenda),
        motivo: data.motivo,
        data_compra: moment(data.dataCompra).format("YYYY-MM-DD"),
        data_descarte: moment(data.dataDescarte).format("YYYY-MM-DD"),
        valor_depreciacao: calcularDepreciacao(data.preco, data.dataCompra),
      };
    };
    if (body.length) {
      const data = [];
      for (i = 0; body.length; i++) {
        if (isDataValid(body[i])) {
          data.push(createPayload(body[i]));
        }
      }
      if (data.length) {
        db.collection("descartes").insertMany();
        return res.status(201).json("Criado");
      }
      return res.status(400).json("Nenhum dado foi criado: dados inválidos");
    }
    if (isDataValid(body)) {
      const payload = createPayload(body);
      db.collection("descartes").insertOne(payload);
      return res.status(201).json("Criado");
    }
    return res.status(400).json("Nenhum dado foi criado: dados inválidos");
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Erro Interno" });
  }
});

app.delete("/itens/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      return res.status(404).json("Id inválido");
    }
    const objectId = new ObjectId(id);
    const exist = await db
      .collection("descartes")
      .findOne({ _id: objectId }, (err, result) => {
        if (err) throw err;
        return result;
      });
    if (exist) {
      db.collection("descartes").deleteOne({ _id: objectId });
      return res.status(200).json("Deletado");
    }
    return res.status(404).json("Dado não pode ser deletado");
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Erro Interno" });
  }
});
