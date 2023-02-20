const Chance = require("chance");
const tesseract = require("tesseract.js");

const chance = new Chance();
const url =
  "https://raw.githubusercontent.com/Basis-Theory-Labs/ocr-example/dc7a8dfcc5a837352fa502c2b2d270e0868dd8ae/card.png";
const createWorker = jest.spyOn(tesseract, "createWorker");

describe("recognize", function () {
  let bt;
  let recognize;

  beforeEach(() => {
    recognize = require("./recognize");
    bt = {
      tokens: {
        create: jest.fn(),
      },
    };
  });

  test("returns internal errors in the response body", async () => {
    const message = `${chance.animal()} is not a toy.`;

    createWorker.mockImplementationOnce(() => {
      throw new TypeError(message);
    });

    const {
      raw: { error },
    } = await recognize({ bt, args: {} });

    expect(error).toEqual(
      expect.objectContaining({
        message,
      })
    );
  });

  test("tokenizes card per URL", async () => {
    const token = chance.string();
    bt.tokens.create.mockResolvedValueOnce(token);

    const { raw } = await recognize({
      bt,
      args: {
        url,
      },
    });

    expect(bt.tokens.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "card",
        data: {
          number: "4242424242424242",
          expiration_month: "04",
          expiration_year: "2024",
          cvc: "242",
        },
      })
    );

    expect(raw.token).toStrictEqual(token);
  });
});
