import assert from "node:assert/strict";
import test from "node:test";
import { billOf, initialSession, productViewOf, reduceSession, searchCatalog } from "./session";

test("bulk tier, free delivery and VAT stay in one place", () => {
  let state = initialSession();
  state = reduceSession(state, { type: "clearCart" });
  state = reduceSession(state, { type: "addProduct", productId: "a4-80-500", packId: "500", qty: 10 });
  const bill = billOf(state);
  assert.equal(bill.count, 10);
  assert.equal(bill.itemsTotal, 180);
  assert.equal(bill.bulkDiscount, 27);
  assert.equal(bill.merchandise, 153);
  assert.equal(bill.deliveryFee, 0);
  assert.equal(bill.handlingFee, 2);
  assert.equal(bill.vat, 7.75);
  assert.equal(bill.grand, 162.75);
  assert.equal(bill.freeDeliveryGap, 0);
});

test("delivery bands follow the merchandise total", () => {
  let small = reduceSession(initialSession(), { type: "clearCart" });
  small = reduceSession(small, { type: "addProduct", productId: "a4-80-500", packId: "500", qty: 1 });
  assert.equal(billOf(small).deliveryFee, 5);

  let mid = reduceSession(initialSession(), { type: "clearCart" });
  mid = reduceSession(mid, { type: "addProduct", productId: "a4-80-500", packId: "500", qty: 4 });
  const midBill = billOf(mid);
  assert.equal(midBill.merchandise, 72);
  assert.equal(midBill.deliveryFee, 3);
  assert.equal(midBill.vat, 3.85);
});

test("out of stock does not enter the cart and low stock is capped", () => {
  let state = reduceSession(initialSession(), { type: "clearCart" });
  state = reduceSession(state, { type: "addProduct", productId: "ink-black", qty: 2 });
  assert.equal(billOf(state).count, 0);
  state = reduceSession(state, { type: "addProduct", productId: "toner-black", qty: 6 });
  assert.equal(billOf(state).count, 3);
});

test("place order clears the cart and keeps the grand total", () => {
  let state = reduceSession(initialSession(), { type: "clearCart" });
  state = reduceSession(state, { type: "addProduct", productId: "sticky-cube", qty: 1 });
  const grand = billOf(state).grand;
  const before = state.orders.length;
  state = reduceSession(state, {
    type: "placeOrder",
    addressId: "addr-office",
    paymentMethod: "cod",
    instruction: "Call on arrival",
    slotLabel: "Express",
  });
  assert.equal(state.lines.length, 0);
  assert.equal(state.orders.length, before + 1);
  assert.equal(state.orders[0]?.total, grand);
  assert.equal(state.orders[0]?.status, "placed");
});

test("search finds paper in English and Arabic without leaving the mode", () => {
  const office = searchCatalog(initialSession(), "A4 paper");
  assert.ok(office.products.some((product) => product.id === "a4-80-500"));
  const arabic = searchCatalog(initialSession(), "ورق");
  assert.ok(arabic.products.some((product) => product.id === "a4-80-500"));
  const schoolOnly = searchCatalog(initialSession(), "backpack");
  assert.equal(schoolOnly.products.some((product) => product.id === "backpack"), false);
});

test("product view hides the bulk table math", () => {
  const view = productViewOf(initialSession(), "a4-80-500", "500");
  assert.ok(view);
  assert.equal(view?.bulkRows[2]?.unitPrice, 15.3);
  assert.equal(view?.packs.length, 2);
});
