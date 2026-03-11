/**
 * Calculates the score for a guess in the music timeline game.
 * 
 * @param correctYear The actual release year of the song.
 * @param guessedYear The year guessed by the player.
 * @param responseTime The time taken to guess in seconds.
 * @returns The total score calculated.
 */
export const calculateScore = (
  correctYear: number,
  guessedYear: number,
  responseTime: number
): number => {
  const distance = Math.abs(correctYear - guessedYear);
  
  // Base score: 1000 minus 100 per year distance, floor of 200
  // 0 years = 1000
  // 1 year = 900
  // 5 years = 500
  // 8+ years = 200
  let baseScore = Math.max(200, 1000 - (distance * 100));

  // Speed bonus:
  // < 5s: +200
  // < 10s: +100
  // < 20s: +50
  let speedBonus = 0;
  if (responseTime < 5) {
    speedBonus = 200;
  } else if (responseTime < 10) {
    speedBonus = 100;
  } else if (responseTime < 20) {
    speedBonus = 50;
  }

  return baseScore + speedBonus;
};
