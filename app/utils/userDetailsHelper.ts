export const generateRandomName = (): string => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `anonymous${randomString}`;
};

export const getPredefinedText = (): string => {
  return "I'm feeling stressed and anxious lately.";
};