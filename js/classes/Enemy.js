export class Inimigo extends Phaser.GameObjects.PathFollower {
    constructor(scene) {
        super(scene, null, 0, 0, 'inimigo1_walk_U');
        this.setActive(false);
        this.setVisible(false);
        this.lastDirection = 'U';
    }

    nascer(path, enemyData, startAt = 0) {
        this.setPath(path);
        const startPoint = path.getPoint(startAt);
        this.setPosition(startPoint.x, startPoint.y);
        
        this.enemyType = enemyData.type;
        this.hp = enemyData.hp;
        this.maxHp = enemyData.hp;
        this.recompensa = enemyData.recompensa;
        this.isFlying = enemyData.isFlying;

        if (!this.barraDeVida) {
            this.barraDeVida = this.scene.add.graphics().setDepth(10);
        }
        
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.setScale(enemyData.scale);
        this.play(`anim_${this.enemyType}_walk_U`, true);
        
        this.startFollow({
            duration: enemyData.speed,
            startAt: startAt
        });
    }

    update() {
        if (!this.active || this.hp <= 0) {
            return;
        }

        this.barraDeVida.clear();
        this.barraDeVida.fillStyle(0x333333);
        this.barraDeVida.fillRect(this.x - (20 * this.scaleX), this.y - (45 * this.scaleY), 40 * this.scaleX, 7);
        const percentualHp = this.hp / this.maxHp;
        let cor;
        if (percentualHp > 0.6) { cor = 0x00ff00; }
        else if (percentualHp > 0.3) { cor = 0xffff00; }
        else { cor = 0xff0000; }
        this.barraDeVida.fillStyle(cor);
        this.barraDeVida.fillRect(this.x - (20 * this.scaleX), this.y - (45 * this.scaleY), (40 * this.scaleX) * percentualHp, 7);

        if (this.pathVector) {
            const angleDeg = Phaser.Math.RadToDeg(this.pathVector.angle());
            const currentAnim = this.anims.currentAnim.key;
            let newAnimKey = '';

            if (angleDeg > -135 && angleDeg < -45) {
                this.lastDirection = 'U';
                newAnimKey = `anim_${this.enemyType}_walk_U`;
                this.setFlipX(false);
            } else if (angleDeg > 45 && angleDeg < 135) {
                this.lastDirection = 'D';
                newAnimKey = `anim_${this.enemyType}_walk_D`;
                this.setFlipX(false);
            } else {
                this.lastDirection = 'S';
                newAnimKey = `anim_${this.enemyType}_walk_S`;
                this.setFlipX(angleDeg >= 135 || angleDeg <= -135);
            }
            
            if (currentAnim !== newAnimKey) {
                this.anims.play(newAnimKey, true);
            }
        }
    }

    receberDano(dano) {
        if (!this.active) return;
        this.hp -= dano;
        if (this.hp <= 0) {
            this.hp = 0;
            this.morrer();
        }
    }

    morrer() {
        if (!this.active) return;
        
        const bonusPorHorda = this.scene.currentWave * 8;
        const dinheiroGanho = this.recompensa + bonusPorHorda;
        this.scene.dinheiro += dinheiroGanho;
        
        this.scene.textoDinheiro.setText(`Dinheiro: ${this.scene.dinheiro}`);
        this.barraDeVida.clear();
        this.body.enable = false;
        this.stop();

        let deathAnimKey;
        if (this.enemyType === 'inimigo1') {
            const deathType = Phaser.Math.Between(1, 2);
            deathAnimKey = `anim_inimigo1_death${deathType === 1 ? '' : '2'}_${this.lastDirection}`;
        } else {
            deathAnimKey = `anim_${this.enemyType}_death_${this.lastDirection}`;
        }

        if (this.lastDirection === 'S' && this.pathVector) {
            this.setFlipX(this.pathVector.x < 0);
        }
        
        this.play(deathAnimKey);
        this.once('animationcomplete', () => {
            this.scene.onEnemyDefeated();
            this.setActive(false).setVisible(false);
            this.destroy();
        });
    }
}
