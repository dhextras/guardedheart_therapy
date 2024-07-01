/**
 * Generates a random string prefixed with "anonymous_"
 * @returns {string} A random string in the format "anonymous_[randomString]"
 */
export const generateRandomName = (): string => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `anonymous_${randomString}`;
};

/**
 * Returns a predefined text string
 * @returns {string} A predefined text string
 */
export const getPredefinedText = (): string => {
  return "I'm feeling a bit overwhelmed lately and just want to share my feelings and talk with someone.";
};
