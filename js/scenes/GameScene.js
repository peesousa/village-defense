import { Inimigo } from '../classes/Enemy.js';
import { TorreArqueiro } from '../classes/Tower.js';
import { WaveGenerator } from '../WaveGenerator.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.CUSTO_TORRE_1 = 100;
        this.CUSTO_VIDA = 150;
        this.VIDA_RECUPERADA = 10;
        this.TOTAL_WAVES = 10;
    }

    preload() {
        this.load.setPath('assets/');
        this.load.image('background', 'fase1.jpeg');
        this.load.image('torre_local_construcao', 'tilesets/2 Objects/PlaceForTower1.png');
        this.load.image('casa_2', 'tilesets/village/2 Objects/7 House/2.png');
        
        for (let i = 1; i <= 4; i++) { ['D', 'S', 'U'].forEach(dir => { this.load.spritesheet(`inimigo${i}_walk_${dir}`, `enemies/${i}/${dir}_Walk.png`, { frameWidth: 48, frameHeight: 48 }); this.load.spritesheet(`inimigo${i}_death_${dir}`, `enemies/${i}/${dir}_Death.png`, { frameWidth: 48, frameHeight: 48 }); }); }
        ['D', 'S', 'U'].forEach(dir => { this.load.spritesheet(`inimigo1_death2_${dir}`, `enemies/1/${dir}_Death2.png`, { frameWidth: 48, frameHeight: 48 }); });
        for (let i = 1; i <= 7; i++){ this.load.spritesheet(`torre_upgrade_${i}`, `towers/1 Upgrade/${i}.png`, { frameWidth: 70, frameHeight: 130 }); this.load.spritesheet(`torre_base_${i}_idle`, `towers/2 Idle/${i}.png`, { frameWidth: 70, frameHeight: 130 }); }
        for (let i = 1; i <= 3; i++){ ['D', 'S', 'U'].forEach(dir => { this.load.spritesheet(`unidade_${i}_idle_${dir}`, `towers/3 Units/${i}/${dir}_Idle.png`, { frameWidth: 48, frameHeight: 48 }); this.load.spritesheet(`unidade_${i}_preattack_${dir}`, `towers/3 Units/${i}/${dir}_Preattack.png`, { frameWidth: 48, frameHeight: 48 }); this.load.spritesheet(`unidade_${i}_attack_${dir}`, `towers/3 Units/${i}/${dir}_Attack.png`, { frameWidth: 48, frameHeight: 48 }); }); }
        this.load.image('flecha_1', 'towers/3 Units/Arrow/1.png');
    }

    init() {
        this.currentWave = 0; this.currentWaveGroup = 0; this.enemiesSpawnedThisGroup = 0; this.totalEnemiesInWave = 0; this.enemiesAlive = 0; this.isWaveActive = false; this.selectedTower = null;
        this.waveGenerator = new WaveGenerator();
    }

    create() {
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.cameras.main.setBounds(0, 0, 960, 960);
        this.dinheiro = 500; this.maxVidaBase = 100; this.vidaBase = this.maxVidaBase;
        this.baseHealthBar = this.add.graphics().setDepth(100);
        this.drawBaseHealthBar();
        this.createAllAnimations();
        this.createUI();
        const locaisParaTorre = [ { x: 770, y: 650 }, { x: 570, y: 490 }, { x: 300, y: 570 }, { x: 760, y: 280 } ];
        const locaisDasDecoracoes = [ { x: 535, y: 95, texture: 'casa_2', flipX: false, scale: 1.5, isBase: true }, { x: 725, y: 95, texture: 'casa_2', flipX: true, scale: 1.5, isBase: true }, ];
        this.baseHouses = [];
        locaisDasDecoracoes.forEach(obj => { const decor = this.add.image(obj.x, obj.y, obj.texture).setOrigin(0.5, 1); if (obj.flipX) decor.setFlipX(true); if (obj.scale) decor.setScale(obj.scale); if (obj.isBase) this.baseHouses.push(decor); });
        this.locaisDeTorre = this.add.group();
        locaisParaTorre.forEach(pos => { const local = this.add.image(pos.x, pos.y, 'torre_local_construcao').setInteractive().setOrigin(0.5, 1); local.setData('ocupado', false); this.addHoverEffect(local); this.locaisDeTorre.add(local); });
        const commonPathPoints = [ 470, 925, 471, 914, 472, 903, 475, 892, 477, 882, 479, 871, 481, 861, 482, 850, 484, 839, 486, 829, 488, 818, 489, 807, 489, 797, 488, 786, 485, 776, 481, 766, 476, 757, 470, 748, 462, 739, 454, 731, 446, 722, 437, 714, 428, 705, 419, 697, 410, 688, 402, 680, 394, 671, 387, 662, 382, 652, 378, 642, 376, 632, 374, 622, 373, 611, 374, 601, 376, 591, 379, 580, 384, 570, 391, 561, 399, 555, 408, 553, 417, 553, 426, 555, 435, 558, 445, 561, 454, 564, 464, 567, 473, 570, 483, 572, 492, 574, 502, 575, 511, 575, 521, 574, 530, 573, 540, 571, 549, 569, 558, 566, 567, 563, 576, 560, 585, 556, 593, 552, 601, 547, 609, 542, 617, 536, 625, 530, 632, 524, 640, 517, 647, 510, 653, 503, 659, 495, 663, 486, 666, 477, 668, 467, 669, 457, 670, 447, 670, 437, 670, 427, 670, 417, 669, 407, 668, 397, 667, 387, 666, 377, 665, 367, 664, 357, 663, 347, 662, 337, 661, 327, 660, 317, 659, 307, 658, 297, 657, 287, 656, 277, 655, 267, 654, 257, 653, 247, 651, 237, 649, 227, 647, 217, 644, 207, 641, 197, 637, 187, 633, 178, 629, 169, 628, 159, 628, 149, 628, 139, 628, 129, 628, 119 ];
        const branch1Points = [ 635,115, 640,115, 644,113, 647,109, 653,101, 657,96, 659,88, 659,82, 660,76, 663,68, 664,61, 665,55, 665,46, 666,40, 666,30 ];
        const branch2Points = [ 620,116, 621,114, 614,107, 611,102, 606,97, 603,91, 602,84, 600,78, 600,70, 600,61, 600,56, 602,48, 600,41, 598,40 ];
        this.path1 = new Phaser.Curves.Spline(commonPathPoints.concat(branch1Points));
        this.path2 = new Phaser.Curves.Spline(commonPathPoints.concat(branch2Points));
        this.inimigos = this.physics.add.group({ classType: Inimigo, runChildUpdate: true });
        this.arqueiros = this.add.group();
        this.flechas = this.physics.add.group();
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '80px', fontFamily: 'Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setDepth(200);
        this.physics.add.overlap(this.flechas, this.inimigos, this.acertouInimigo, null, this);
        this.startNextWave();
        this.input.on('pointerdown', (pointer) => {
            if (this.isPointerOverUI(pointer)) return;

            const topObject = this.input.manager.hitTest(pointer, this.children.list, this.cameras.main)[0];

            if (topObject instanceof TorreArqueiro) {
                this.selectTower(topObject);
            } else if (this.locaisDeTorre.contains(topObject) && !topObject.getData('ocupado')) {
                this.handleBuild(topObject);
            } else {
                this.deselectTower();
            }
        });
    }

    update(time, delta) {
        this.inimigos.getChildren().forEach(inimigo => { if (inimigo.active && inimigo.y < 50) { this.inimigoAlcancouObjetivo(inimigo); } });
        this.arqueiros.getChildren().forEach(torre => { torre.update(time, this.inimigos); });
        this.flechas.getChildren().forEach(flecha => { if (flecha.y < -10 || flecha.y > 1034 || flecha.x < -10 || flecha.x > 1034) { flecha.destroy(); } });
        this.updateBuyHealthButton();
    }

    createAllAnimations() {
        for (let i = 1; i <= 4; i++) { ['D', 'S', 'U'].forEach(dir => { this.anims.create({ key: `anim_inimigo${i}_walk_${dir}`, frames: this.anims.generateFrameNumbers(`inimigo${i}_walk_${dir}`), frameRate: 10, repeat: -1 }); }); }
        for (let i = 1; i <= 4; i++) { ['D', 'S', 'U'].forEach(dir => { this.anims.create({ key: `anim_inimigo${i}_death_${dir}`, frames: this.anims.generateFrameNumbers(`inimigo${i}_death_${dir}`), frameRate: 10, repeat: 0 }); }); }
        ['D', 'S', 'U'].forEach(dir => { this.anims.create({ key: `anim_inimigo1_death2_${dir}`, frames: this.anims.generateFrameNumbers(`inimigo1_death2_${dir}`), frameRate: 10, repeat: 0 }); });
        for (let i = 1; i <= 7; i++) { this.anims.create({ key: `anim_torre_upgrade_${i}`, frames: this.anims.generateFrameNumbers(`torre_upgrade_${i}`), frameRate: 10, repeat: 0 }); this.anims.create({ key: `anim_torre_base_${i}_idle`, frames: this.anims.generateFrameNumbers(`torre_base_${i}_idle`), frameRate: 5, repeat: -1 }); }
        for (let i = 1; i <= 3; i++) { ['D', 'S', 'U'].forEach(dir => { this.anims.create({ key: `anim_unidade_${i}_idle_${dir}`, frames: this.anims.generateFrameNumbers(`unidade_${i}_idle_${dir}`), frameRate: 8, repeat: -1 }); this.anims.create({ key: `anim_unidade_${i}_preattack_${dir}`, frames: this.anims.generateFrameNumbers(`unidade_${i}_preattack_${dir}`), frameRate: 15, repeat: 0 }); this.anims.create({ key: `anim_unidade_${i}_attack_${dir}`, frames: this.anims.generateFrameNumbers(`unidade_${i}_attack_${dir}`), frameRate: 15, repeat: 0 }); }); }
    }

    acertouInimigo(flecha, inimigo) {
        if (flecha.active && inimigo.active) {
            inimigo.receberDano(flecha.getData('dano'));
            flecha.destroy();
        }
    }

    startNextWave() {
        if (this.currentWave >= this.TOTAL_WAVES) {
            this.gameWin();
            return;
        }
        
        this.isWaveActive = true;
        
        const waveConfig = this.waveGenerator.generateWave(this.currentWave);
        const waveGroups = waveConfig[0];
        
        this.totalEnemiesInWave = waveGroups.reduce((acc, group) => acc + group.count, 0);
        
        this.waveText.setText(`Horda ${this.currentWave + 1}`);
        this.time.delayedCall(2000, () => {
            this.waveText.setText('');
            this.startSpawningGroups(waveGroups);
        });
    }

    startSpawningGroups(waveGroups) {
        let totalDelay = 0;
        waveGroups.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                this.time.delayedCall(totalDelay, () => {
                    this.spawnInimigo(group.enemy);
                });
                totalDelay += group.delay;
            }
        });
    }

    spawnInimigo(enemyData) {
        this.enemiesAlive++;
        const chosenPath = Phaser.Math.Between(1, 2) === 1 ? this.path1 : this.path2;
        const inimigo = this.inimigos.get();
        if (inimigo) {
            inimigo.nascer(chosenPath, enemyData);
        }
    }

    onEnemyDefeated(enemyType) {
        if (enemyType) {
            this.inimigosDerrotados[enemyType] = (this.inimigosDerrotados[enemyType] || 0) + 1;
        }

        this.enemiesAlive--;
        if (this.enemiesAlive <= 0 && this.isWaveActive) {
            this.isWaveActive = false;
            this.currentWave++;
            this.time.delayedCall(3000, this.startNextWave, [], this);
        }
    }

    inimigoAlcancouObjetivo(inimigo) {
        this.vidaBase -= 10;
        this.drawBaseHealthBar();
        inimigo.setActive(false).setVisible(false);
        if (inimigo.barraDeVida) inimigo.barraDeVida.clear();
        this.onEnemyDefeated();
        this.tweens.add({
            targets: this.baseHouses,
            tint: 0xff0000,
            duration: 150,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.baseHouses.forEach(house => house.clearTint());
            }
        });
        if (this.vidaBase <= 0) {
            this.vidaBase = 0;
            this.drawBaseHealthBar();
            this.gameOver();
        }
    }

    drawBaseHealthBar() {
        this.baseHealthBar.clear();
        const x = this.cameras.main.width / 2;
        const y = 10;
        const w = 300;
        const h = 20;
        this.baseHealthBar.fillStyle(0x333333);
        this.baseHealthBar.fillRect(x - w / 2, y, w, h);
        if (this.vidaBase > 0) {
            const percentualHp = this.vidaBase / this.maxVidaBase;
            let cor;
            if (percentualHp > 0.6) { cor = 0x00ff00; }
            else if (percentualHp > 0.3) { cor = 0xffff00; }
            else { cor = 0xff0000; }
            this.baseHealthBar.fillStyle(cor);
            this.baseHealthBar.fillRect(x - w / 2, y, w * percentualHp, h);
        }
    }

    gameOver() {
        this.physics.pause();
        if (this.enemySpawner) this.enemySpawner.destroy();
        this.baseHealthBar.clear();
        this.events.emit('gameOver');
    }

    gameWin() {
        this.physics.pause();
        this.events.emit('gameWin', 'GameScene2'); 
    }

    addHoverEffect(gameObject) {
        gameObject.on('pointerover', () => { this.input.setDefaultCursor('pointer'); if (gameObject instanceof TorreArqueiro) { this.showTowerHoverInfo(gameObject); } });
        gameObject.on('pointerout', () => { this.input.setDefaultCursor('default'); if (gameObject instanceof TorreArqueiro) { this.hideTowerHoverInfo(); } });
    }

    createUI() {
        this.textoDinheiro = this.add.text(10, 10, `Dinheiro: ${this.dinheiro}`, { fontSize: '24px', fontFamily: 'Arial', color: '#ffdd00', stroke: '#000000', strokeThickness: 4 }).setDepth(100);
        this.buyHealthBtn = this.add.text(230, 10, '[+]', { fontSize: '24px', fontFamily: 'Arial', color: '#00ff00', stroke: '#000000', strokeThickness: 4 }).setDepth(100).setInteractive();
        this.buyHealthBtn.on('pointerdown', (pointer, localX, localY, event) => { event.stopPropagation(); this.buyHealth(); });
        this.addHoverEffect(this.buyHealthBtn);
        this.warningText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '48px', fontFamily: 'Arial', color: '#ff0000', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setDepth(300).setAlpha(0);
        this.hoverTooltip = this.createTooltip();
        this.upgradeConfirmWindow = this.createUpgradeConfirmWindow();
    }

    handleBuild(localClicado) {
        this.deselectTower();
        if (this.dinheiro < this.CUSTO_TORRE_1) {
            this.showWarning('Dinheiro Insuficiente');
            return;
        }
        this.dinheiro -= this.CUSTO_TORRE_1;
        this.textoDinheiro.setText(`Dinheiro: ${this.dinheiro}`);
        localClicado.setData('ocupado', true).disableInteractive().setVisible(false);
        const construcao = this.add.sprite(localClicado.x, localClicado.y, 'torre_upgrade_1').setOrigin(0.5, 1).play('anim_torre_upgrade_1');
        construcao.once('animationcomplete', () => {
            construcao.destroy();
            const torreFuncional = new TorreArqueiro(this, localClicado.x, localClicado.y, this.flechas);
            this.addHoverEffect(torreFuncional);
            this.arqueiros.add(torreFuncional);
        });
    }

    createUpgradeConfirmWindow() {
        const container = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2).setDepth(204).setVisible(false);
        const bg = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.9 } }).fillRect(-150, -100, 300, 200);
        const title = this.add.text(0, -80, 'Confirmar Upgrade', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
        const statsText = this.add.text(0, -20, '', { fontSize: '16px', align: 'center', color: '#fff', padding: { x: 10 } }).setOrigin(0.5);
        const confirmBtn = this.add.text(-50, 60, 'Confirmar', { fontSize: '16px', backgroundColor: '#28a745', padding: 8 }).setOrigin(0.5).setInteractive();
        const cancelBtn = this.add.text(50, 60, 'Cancelar', { fontSize: '16px', backgroundColor: '#dc3545', padding: 8 }).setOrigin(0.5).setInteractive();
        confirmBtn.on('pointerdown', (pointer, localX, localY, event) => { event.stopPropagation(); this.confirmUpgrade(); });
        cancelBtn.on('pointerdown', (pointer, localX, localY, event) => { event.stopPropagation(); this.deselectTower(); });
        container.add([bg, title, statsText, confirmBtn, cancelBtn]);
        return container;
    }

    showUpgradeConfirmWindow() {
        if (!this.selectedTower) return;
        const cost = this.selectedTower.getUpgradeCost();
        if (cost) {
            const stats = this.selectedTower.getNextUpgradeStats();
            const text = this.upgradeConfirmWindow.getAt(2);
            const danoStr = `Dano: ${this.selectedTower.dano} -> ${stats.dano}`;
            const alcanceStr = `Alcance: ${this.selectedTower.alcance} -> ${stats.alcance}`;
            const cadenciaStr = `Cadência: ${this.selectedTower.cadencia} -> ${stats.cadencia}`;
            text.setText([danoStr, alcanceStr, cadenciaStr, `\nCusto: ${cost}`]);
            this.upgradeConfirmWindow.setVisible(true);
        } else {
            this.showWarning('Nível Máximo');
            this.deselectTower();
        }
    }

    confirmUpgrade() {
        const tower = this.selectedTower;
        if (!tower) return;
        const cost = tower.getUpgradeCost();
        if (this.dinheiro >= cost) {
            this.dinheiro -= cost;
            this.textoDinheiro.setText(`Dinheiro: ${this.dinheiro}`);
            const upgradeAnimKey = `anim_torre_upgrade_${tower.level + 2}`;
            const upgradeAnim = this.add.sprite(tower.x, tower.y, `torre_upgrade_${tower.level + 2}`).setOrigin(0.5, 1).play(upgradeAnimKey);
            tower.setVisible(false);
            upgradeAnim.once('animationcomplete', () => {
                upgradeAnim.destroy();
                tower.upgrade();
                tower.setVisible(true);
            });
        } else {
            this.showWarning('Dinheiro Insuficiente');
        }
        this.deselectTower();
    }

    buyHealth() {
        if (this.dinheiro >= this.CUSTO_VIDA && this.vidaBase < this.maxVidaBase) {
            this.dinheiro -= this.CUSTO_VIDA;
            this.vidaBase = Math.min(this.maxVidaBase, this.vidaBase + this.VIDA_RECUPERADA);
            this.textoDinheiro.setText(`Dinheiro: ${this.dinheiro}`);
            this.drawBaseHealthBar();
        } else if (this.dinheiro < this.CUSTO_VIDA) {
            this.showWarning('Dinheiro Insuficiente');
        }
    }

    updateBuyHealthButton() {
        if (this.buyHealthBtn) {
            const canAfford = this.dinheiro >= this.CUSTO_VIDA;
            const needsHealth = this.vidaBase < this.maxVidaBase;
            this.buyHealthBtn.setAlpha(canAfford && needsHealth ? 1.0 : 0.5);
        }
    }

    showWarning(text) {
        this.warningText.setText(text);
        this.warningText.setAlpha(1);
        this.tweens.add({ targets: this.warningText, alpha: 0, duration: 1500, ease: 'Linear' });
    }

    isPointerOverUI(pointer) {
        if (this.upgradeConfirmWindow.visible) {
            for (const child of this.upgradeConfirmWindow.list) {
                if (!child.getBounds) continue;
                const bounds = child.getBounds();
                if (bounds.contains(pointer.x, pointer.y)) {
                    return true;
                }
            }
        }
        return false;
    }

    createTooltip() {
        const tooltip = this.add.container(0, 0).setDepth(201).setVisible(false);
        const bg = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.7 } });
        const text = this.add.text(0, 0, '', { fontSize: '14px', fontFamily: 'Arial', color: '#fff', padding: 5 });
        tooltip.add([bg, text]);
        return tooltip;
    }

    selectTower(tower) {
        this.deselectTower();
        this.selectedTower = tower;
        this.showUpgradeConfirmWindow();
    }

    deselectTower() {
        if (this.selectedTower) {
            this.selectedTower = null;
        }
        this.upgradeConfirmWindow.setVisible(false);
    }

    showTowerHoverInfo(tower) {
        const cost = tower.getUpgradeCost();
        const costText = cost ? `Custo Prox. Nível: ${cost}` : 'Nível Máximo';
        const info = `Nível: ${tower.level + 1}\n${costText}`;
        const text = this.hoverTooltip.getAt(1);
        const bg = this.hoverTooltip.getAt(0);
        text.setText(info);
        bg.clear().fillRect(0, 0, text.width + 10, text.height + 10);
        text.setPosition(5, 5);
        this.hoverTooltip.setPosition(tower.x - (text.width + 10) / 2, tower.y - tower.height - text.height - 15);
        this.hoverTooltip.setVisible(true);
    }

    hideTowerHoverInfo() {
        this.hoverTooltip.setVisible(false);
    }
}
