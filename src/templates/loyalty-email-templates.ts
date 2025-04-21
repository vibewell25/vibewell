export const pointsExpiringTemplate = (points: number, daysUntilExpiry: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #2C5282; font-size: 24px; margin-bottom: 20px; }
    .content { line-height: 1.6; color: #2D3748; }
    .cta-button { 
      background-color: #4299E1;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">Don't Let Your Points Expire!</h1>
    <div class="content">
      <p>Your ${points} points will expire in ${daysUntilExpiry} days.</p>
      <p>Book a service now to use your points before they expire.</p>
      <a href="{bookingUrl}" class="cta-button">Book Now</a>
    </div>
  </div>
</body>
</html>`;

export const pointMultiplierTemplate = (multiplier: number, endDate: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #2C5282; font-size: 24px; margin-bottom: 20px; }
    .content { line-height: 1.6; color: #2D3748; }
    .highlight { color: #E53E3E; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">Limited Time Points Multiplier!</h1>
    <div class="content">
      <p>Earn <span class="highlight">${multiplier}x points</span> on all services until ${endDate}!</p>
      <p>Don't miss this opportunity to boost your rewards.</p>
      <a href="{bookingUrl}" class="cta-button">Book Now</a>
    </div>
  </div>
</body>
</html>`;

export const rewardUnlockedTemplate = (rewardName: string, pointsCost: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #2C5282; font-size: 24px; margin-bottom: 20px; }
    .content { line-height: 1.6; color: #2D3748; }
    .reward-box {
      border: 2px solid #4299E1;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">New Reward Unlocked! 🎉</h1>
    <div class="content">
      <div class="reward-box">
        <h2>${rewardName}</h2>
        <p>Redeem now for ${pointsCost} points</p>
      </div>
      <p>Visit your rewards page to claim this exclusive offer.</p>
      <a href="{rewardsUrl}" class="cta-button">View Reward</a>
    </div>
  </div>
</body>
</html>`;

export const seasonalChallengeTemplate = (challengeName: string, reward: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #2C5282; font-size: 24px; margin-bottom: 20px; }
    .content { line-height: 1.6; color: #2D3748; }
    .challenge-box {
      background-color: #EBF8FF;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">New Seasonal Challenge!</h1>
    <div class="content">
      <div class="challenge-box">
        <h2>${challengeName}</h2>
        <p>Complete this challenge to earn: ${reward}</p>
      </div>
      <p>Start the challenge now and earn exclusive rewards!</p>
      <a href="{challengeUrl}" class="cta-button">Start Challenge</a>
    </div>
  </div>
</body>
</html>`;
