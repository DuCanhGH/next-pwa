export function utils(message: string) {
  console.log("Hello from utils.");
  console.log("es6+ syntax test:");
  // eslint-disable-next-line prefer-const
  let foo = { message: message };
  console.log(foo?.message);
}
