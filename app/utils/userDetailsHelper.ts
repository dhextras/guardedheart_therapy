export const generateRandomName = (): string => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `anonymous_${randomString}`;
};

export const getPredefinedText = (): string => {
  return "I'm feeling a bit overwhelmed lately and just want to share my feelings and talk with someone.";
};
