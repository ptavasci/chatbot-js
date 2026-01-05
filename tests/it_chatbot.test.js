const request = require("supertest");
const app = require("../src/app");

describe("ChatBot API V2 (IT Supplies)", () => {
  it("should answer questions about IT product prices correctly", async () => {
    const res = await request(app)
      .post("/chatt")
      .send({
        message: "¿Cuánto cuesta el Monitor Gamer LG 27\" UltraGear?",
        chat_id: "test-session-" + Date.now()
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.response).toContain("350");
  }, 30000);

  it("should answer questions about IT product features correctly", async () => {
    const res = await request(app)
      .post("/chatt")
      .send({
        message: "¿Qué switches tiene el Teclado Mecánico Corsair K70 RGB?",
        chat_id: "test-session-" + Date.now()
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.response.toLowerCase()).toContain("cherry mx red");
  }, 30000);
});
