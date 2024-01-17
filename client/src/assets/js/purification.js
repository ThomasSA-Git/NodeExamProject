export function purify(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function purifyData(data) {
  switch (data.type) {
    case "header":
    case "paragraph":
      data.text = purify(data.text);
      break;
    case "quote":
      data.text = purify(data.text);
      data.caption = purify(data.caption);
      break;
    case "list":
      data.items = data.items.map((item) => purify(item));
      break;
  }

  return data;
}
