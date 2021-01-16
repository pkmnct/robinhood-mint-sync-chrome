export interface config {
  type: string;
  name: string;
}

export const log = (config: config, message: string): void => {
  const typePrefix =
    config.type === "background"
      ? "[Background]"
      : config.type === "content"
      ? "[Content]"
      : "";

  const namePrefix = `(${config.name}) `;

  console.log(`${typePrefix}${namePrefix}${message}`);
};
