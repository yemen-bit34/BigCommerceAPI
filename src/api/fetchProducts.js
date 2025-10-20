export const fetchProducts = async () => {
  const url = "http://localhost:3000/api/products";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
  return await response.json();
};
