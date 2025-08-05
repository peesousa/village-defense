const upgradeConfig = [
    { cost: 0,    dano: 25, alcance: 200, cadencia: 1000, texture: 'torre_base_1_idle', unitType: 1, unitOffsetY: -20, unitDepth: 1, canHitFlying: false },
    { cost: 150,  dano: 25, alcance: 220, cadencia: 950,  texture: 'torre_base_2_idle', unitType: 1, unitOffsetY: -30, unitDepth: 1, canHitFlying: false },
    { cost: 300,  dano: 40, alcance: 240, cadencia: 900,  texture: 'torre_base_3_idle', unitType: 1, unitOffsetY: -40, unitDepth: 1, canHitFlying: true },
    { cost: 450,  dano: 40, alcance: 260, cadencia: 850,  texture: 'torre_base_4_idle', unitType: 2, unitOffsetY: -40, unitDepth: -1, canHitFlying: true },
    { cost: 600,  dano: 45, alcance: 280, cadencia: 800,  texture: 'torre_base_5_idle', unitType: 2, unitOffsetY: -40, unitDepth: 1, canHitFlying: true },
    { cost: 750,  dano: 45, alcance: 290, cadencia: 750,  texture: 'torre_base_6_idle', unitType: 3, unitOffsetY: -40, unitDepth: 1, canHitFlying: true },
    { cost: 1000, dano: 50, alcance: 300, cadencia: 700,  texture: 'torre_base_7_idle', unitType: 3, unitOffsetY: -40, unitDepth: -1, canHitFlying: true },
];

export class TorreArqueiro extends Phaser.GameObjects.Container {
    constructor(scene, x, y, grupoFlechas) {
        super(scene, x, y);
        this.grupoFlechas = grupoFlechas;
        this.proximoTiro = 0;
        this.level = 0;
        this.alvo = null;

        this.baseSprite = scene.add.sprite(0, 0, 'torre_base_1_idle').setOrigin(0.5, 1);
        this.unidadeArqueiro = scene.add.sprite(0, -20, 'unidade_1_idle_S').setOrigin(0.5, 1);
        
        this.add([this.baseSprite, this.unidadeArqueiro]);
        scene.add.existing(this);

        this.setSize(this.baseSprite.width, this.baseSprite.height);
        this.setInteractive();

        this.applyUpgrade();
    }

    applyUpgrade() {
        const config = upgradeConfig[this.level];
        this.dano = config.dano;
        this.alcance = config.alcance;
        this.cadencia = config.cadencia;
        this.unitType = config.unitType;
        this.canHitFlying = config.canHitFlying;
        
        this.baseSprite.setTexture(config.texture);
        this.baseSprite.play(`anim_${config.texture}`);
        
        this.unidadeArqueiro.play(`anim_unidade_${this.unitType}_idle_S`);
        this.unidadeArqueiro.setY(config.unitOffsetY);
        
        if (config.unitDepth < 0) {
            this.moveTo(this.unidadeArqueiro, 0);
        } else {
            this.moveTo(this.baseSprite, 0);
        }
    }

    upgrade() {
        if (this.level < upgradeConfig.length - 1) {
            this.level++;
            this.applyUpgrade();
        }
    }

    getUpgradeCost() {
        if (this.level < upgradeConfig.length - 1) {
            return upgradeConfig[this.level + 1].cost;
        }
        return null;
    }
    
    getNextUpgradeStats() {
        if (this.level < upgradeConfig.length - 1) {
            return upgradeConfig[this.level + 1];
        }
        return { dano: 'MAX', alcance: 'MAX', cadencia: 'MAX' };
    }
    
    update(time, inimigos) {
        if (this.alvo && (!this.alvo.active || Phaser.Math.Distance.Between(this.x, this.y, this.alvo.x, this.alvo.y) > this.alcance)) {
            this.alvo = null;
        }

        if (!this.alvo) {
            const alvosVivos = inimigos.getMatching('active', true);
            const alvosValidos = alvosVivos.filter(inimigo => {
                const inRange = Phaser.Math.Distance.Between(this.x, this.y, inimigo.x, inimigo.y) <= this.alcance;
                if (inimigo.isFlying) {
                    return this.canHitFlying && inRange;
                }
                return inRange;
            });

            if (alvosValidos.length > 0) {
                alvosValidos.sort((a, b) => b.pathTween.progress - a.pathTween.progress);
                this.alvo = alvosValidos[0];
            }
        }

        if (this.alvo && time > this.proximoTiro) {
            this.proximoTiro = time + this.cadencia;
            this.atirar(this.alvo);
        }
    }

    atirar(alvo) {
        const angulo = Phaser.Math.Angle.Between(this.x, this.y, alvo.x, alvo.y);
        const anguloGraus = Phaser.Math.RadToDeg(angulo);
        let direcao = 'S';
        if (anguloGraus > 45 && anguloGraus <= 135) { direcao = 'D' }
        else if (anguloGraus > -135 && anguloGraus < -45) { direcao = 'U' }
        
        this.unidadeArqueiro.setFlipX(anguloGraus > 135 || anguloGraus < -135);

        const preattackAnim = `anim_unidade_${this.unitType}_preattack_${direcao}`;
        const attackAnim = `anim_unidade_${this.unitType}_attack_${direcao}`;
        const idleAnim = `anim_unidade_${this.unitType}_idle_${direcao}`;
        
        this.unidadeArqueiro.play(preattackAnim);
        
        this.unidadeArqueiro.once(`animationcomplete-${preattackAnim}`, () => {
            const flecha = this.grupoFlechas.create(this.x, this.y + this.unidadeArqueiro.y, 'flecha_1');
            if (flecha) {
                flecha.setData('dano', this.dano);
                flecha.setRotation(angulo + Math.PI / 2);
                this.scene.physics.moveToObject(flecha, alvo, 400);
            }
            
            this.unidadeArqueiro.play(attackAnim);
            
            this.unidadeArqueiro.once(`animationcomplete-${attackAnim}`, () => {
                this.unidadeArqueiro.play(idleAnim);
            });
        });
    }
}
