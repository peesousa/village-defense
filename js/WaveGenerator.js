const ENEMY_STATS = {
    'inimigo1': { hp: 80, recompensa: 10, speed: 32000, scale: 1.0, isFlying: false, points: 10 },
    'inimigo2': { hp: 250, recompensa: 25, speed: 45000, scale: 1.2, isFlying: false, points: 25 },
    'inimigo3': { hp: 120, recompensa: 15, speed: 22000, scale: 1.1, isFlying: false, points: 15 },
    'inimigo4': { hp: 150, recompensa: 30, speed: 20000, scale: 1.5, isFlying: true, points: 40 }
};

export class WaveGenerator {
    constructor() {}

    generateWave(waveNumber) {
        const hpMultiplier = 1 + (waveNumber * 0.15);
        const enemyCount = 5 + Math.floor(waveNumber * 1.8);

        let enemyPool = ['inimigo1'];
        if (waveNumber >= 2) enemyPool.push('inimigo3');
        if (waveNumber >= 4) enemyPool.push('inimigo2');
        if (waveNumber >= 6) enemyPool.push('inimigo4');
        if (waveNumber > 5) enemyPool.push('inimigo3', 'inimigo2');
        if (waveNumber > 8) enemyPool.push('inimigo4', 'inimigo2');
        
        const waveEnemies = [];
        for (let i = 0; i < enemyCount; i++) {
            const randomEnemyType = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            const baseStats = ENEMY_STATS[randomEnemyType];

            waveEnemies.push({
                count: 1,
                delay: Math.max(500, 2500 - (waveNumber * 80)),
                enemy: { 
                    type: randomEnemyType,
                    ...baseStats, 
                    hp: Math.round(baseStats.hp * hpMultiplier) 
                }
            });
        }
        
        return [waveEnemies];
    }
}
