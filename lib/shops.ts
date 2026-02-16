export interface Shop {
  name: string;
  cuisine: string;
  prompts: {
    en: string;
    cn: string;
  };
}

export const shops: Record<string, Shop> = {
  shop_001: {
    name: "Happy Lamb Hot Pot",
    cuisine: "Chinese Hot Pot",
    prompts: {
      en: "Write a Google Review style review for a Chinese hot pot restaurant. Make it authentic, detailed, and helpful for other diners. Include specific dishes you enjoyed, service quality, ambiance, and value for money. Keep it natural and conversational.",
      cn: "写一篇小红书风格的餐厅评价，包含丰富的表情符号。描述这家火锅店的用餐体验，包括菜品特色、服务感受、环境氛围和性价比。语言要生动有趣，适合在小红书平台分享。",
    },
  },
};
