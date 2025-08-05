import { Inimigo } from '../classes/Enemy.js';
import { TorreArqueiro } from '../classes/Tower.js';
import { WaveGenerator } from '../WaveGenerator.js';

export class GameScene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene2' });
        this.CUSTO_TORRE_1 = 100;
        this.CUSTO_VIDA = 150;
        this.VIDA_RECUPERADA = 10;
        this.TOTAL_WAVES = 15;
    }

    preload() {
        this.load.setPath('assets/');
        this.load.image('background2', 'fase2.png');
        this.load.image('torre_local_construcao', 'tilesets/2 Objects/PlaceForTower1.png');
        this.load.image('casa_1', 'tilesets/village/2 Objects/7 House/1.png');
        this.load.image('casa_2', 'tilesets/village/2 Objects/7 House/2.png');
        this.load.image('casa_3', 'tilesets/village/2 Objects/7 House/3.png');
        
        this.load.image('tenda_1', 'tilesets/village/2 Objects/6 Tent/1.png');
        this.load.image('tenda_2', 'tilesets/village/2 Objects/6 Tent/2.png');
        this.load.image('tenda_3', 'tilesets/village/2 Objects/6 Tent/3.png');
        this.load.image('tenda_4', 'tilesets/village/2 Objects/6 Tent/4.png');

        this.load.image('caixa_2', 'tilesets/village/2 Objects/4 Box/2.png');
        this.load.image('caixa_3', 'tilesets/village/2 Objects/4 Box/3.png');
        this.load.image('caixa_5', 'tilesets/village/2 Objects/4 Box/5.png');
        
        this.load.spritesheet('citizen_1', 'tilesets/citizens/1/D_Idle.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('citizen_2', 'tilesets/citizens/2/D_Idle.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('citizen_3', 'tilesets/citizens/3/D_Idle.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('citizen_4', 'tilesets/citizens/4/D_Idle.png', {frameWidth: 48, frameHeight: 48});
        
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
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        this.scene.launch('UIScene', { currentScene: this.scene.key });

        const background2 = this.add.image(0, 0, 'background2').setOrigin(0, 0);
        background2.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.cameras.main.setBounds(0, 0, 960, 960);
        this.dinheiro = 1500; this.maxVidaBase = 100; this.vidaBase = this.maxVidaBase;
        this.baseHealthBar = this.add.graphics().setDepth(100);
        this.drawBaseHealthBar();
        this.createAllAnimations();
        this.createUI();
        const locaisParaTorre = [
            { x: 770, y: 650 },
            {x: 295, y: 734},
            {x: 500, y: 685},
            {x: 790, y: 496},
            {x: 560, y: 496},
            {x: 201, y: 483},
            {x: 190, y: 650}
        ];
        
        const decoracoes = {
            objetos: [],
            pessoas: [],
            tendas: [],
            casas: []
        };

        const locaisDasDecoracoes = [
            { type: 'casas', x: 671, y: 479, texture: 'casa_3', flipX: false, scale: 1.5 },
            { type: 'casas', x: 880, y: 260, texture: 'casa_2', flipX: false, scale: 1 },
            { type: 'casas', x: 899, y: 104, texture: 'casa_1', flipX: true, scale: 1 },
            { type: 'casas', x: 789, y: 104, texture: 'casa_1', flipX: false, scale: 1 },
            { type: 'tendas', x: 676, y: 47, texture: 'tenda_3', flipX: false, scale: 1 },
            { type: 'tendas', x: 764, y: 194, texture: 'tenda_4', flipX: false, scale: 1 },
            { type: 'tendas', x: 683, y: 125, texture: 'tenda_2', flipX: false, scale: 1 },
            { type: 'tendas', x: 567, y: 184, texture: 'tenda_3', flipX: false, scale: 1 },
            { type: 'tendas', x: 587, y: 76, texture: 'tenda_1', flipX: false, scale: 1 },
            { type: 'objetos', x: 587, y: 76, texture: 'caixa_2', flipX: false, scale: 1 },
            { type: 'objetos', x: 799, y: 248, texture: 'caixa_3', flipX: false, scale: 1 },
            { type: 'objetos', x: 760, y: 248, texture: 'caixa_5', flipX: false, scale: 1 },
            { type: 'objetos', x: 541, y: 202, texture: 'caixa_2', flipX: false, scale: 1 },
            { type: 'objetos', x: 598, y: 195, texture: 'caixa_5', flipX: false, scale: 1 },
            { type: 'objetos', x: 751, y: 187, texture: 'caixa_3', flipX: false, scale: 1 },
            { type: 'objetos', x: 703, y: 154, texture: 'caixa_3', flipX: false, scale: 1 },
            { type: 'objetos', x: 751, y: 117, texture: 'caixa_5', flipX: false, scale: 1 },
            { type: 'objetos', x: 819, y: 117, texture: 'caixa_2', flipX: false, scale: 1 },
            { type: 'objetos', x: 833, y: 148, texture: 'caixa_3', flipX: false, scale: 1 },
            { type: 'objetos', x: 545, y: 100, texture: 'caixa_5', flipX: false, scale: 1 },
            { type: 'pessoas', x: 695, y: 178, texture: 'citizen_1', flipX: false, scale: 1 },
            { type: 'pessoas', x: 773, y: 202, texture: 'citizen_3', flipX: false, scale: 1 },
            { type: 'pessoas', x: 878, y: 119, texture: 'citizen_1', flipX: false, scale: 1 },
            { type: 'pessoas', x: 884, y: 117, texture: 'citizen_1', flipX: false, scale: 1 },
            { type: 'pessoas', x: 570, y: 87, texture: 'citizen_2', flipX: false, scale: 1 },
            { type: 'pessoas', x: 610, y: 89 , texture: 'citizen_3', flipX: false, scale: 1 },
            { type: 'pessoas', x: 620, y: 155, texture: 'citizen_4', flipX: false, scale: 1 },
            { type: 'pessoas', x: 636, y: 116, texture: 'citizen_2', flipX: false, scale: 1 },
            { type: 'pessoas', x: 664, y: 187, texture: 'citizen_1', flipX: false, scale: 1 },
            { type: 'pessoas', x: 662, y: 224, texture: 'citizen_3', flipX: false, scale: 1 },
            { type: 'pessoas', x: 715, y: 243, texture: 'citizen_4', flipX: false, scale: 1 },
            { type: 'pessoas', x: 818, y: 276, texture: 'citizen_4', flipX: false, scale: 1 },
            { type: 'pessoas', x: 884, y: 275, texture: 'citizen_1', flipX: false, scale: 1 },
            { type: 'pessoas', x: 919, y: 255, texture: 'citizen_2', flipX: false, scale: 1 },
            { type: 'pessoas', x: 657, y: 58, texture: 'citizen_2', flipX: false, scale: 1 },
        ];
        
        locaisDasDecoracoes.forEach(d => decoracoes[d.type].push(d));

        this.baseHouses = [];

        const renderLayer = (layer, depth) => {
            decoracoes[layer].forEach(obj => {
                let decor;
                if (obj.type === 'pessoas') {
                    decor = this.add.sprite(obj.x, obj.y, obj.texture).setOrigin(0.5, 1);
                    decor.play(`anim_${obj.texture}`);
                } else {
                    decor = this.add.image(obj.x, obj.y, obj.texture).setOrigin(0.5, 1);
                }
                
                if (obj.flipX) decor.setFlipX(true);
                if (obj.scale) decor.setScale(obj.scale);
                decor.setDepth(depth);

                if (obj.isBase) this.baseHouses.push(decor);
            });
        };

        renderLayer('objetos', 1);
        renderLayer('pessoas', 2);
        renderLayer('tendas', 3);
        renderLayer('casas', 4);

        this.locaisDeTorre = this.add.group();
        locaisParaTorre.forEach(pos => { const local = this.add.image(pos.x, pos.y, 'torre_local_construcao').setInteractive().setOrigin(0.5, 1); local.setData('ocupado', false); this.addHoverEffect(local); this.locaisDeTorre.add(local); });
        
        const points1 = [ 460,936, 465,901, 471,879, 481,852, 497,833, 487,810, 483,792, 483,776, 476,770, 451,750, 435,734, 422,720, 406,710, 394,690, 385,678, 378,648, 372,631, 360,601, 362,567, 378,563, 414,563, 453,563, 488,563, 527,563, 562,563, 624,543, 642,521, 653,492, 658,468, 670,447, 677,422, 681,389, 681,373, 653,250, 682,223 ];
        const points2 = [ 10,545, 23,544, 59,540, 87,544, 137,544, 166,544, 197,544, 199,544, 252,544, 270,546, 297,549, 339,549, 376,549, 390,555, 430,555, 452,564, 464,569, 488,574, 526,568, 545,564, 581,549, 608,533, 644,509, 658,486, 670,455, 670,424, 675,400, 676,362, 694,334, 682,223  ];
        const points3 = [ 947,543, 936,543, 919,543, 895,543, 866,543, 841,543, 798,545, 768,545, 750,545, 720,545, 717,545, 689,545, 670,532, 666,515, 669,494, 666,478, 664,423, 664,385, 669,363, 670,306, 670,265, 682,223 ];
        this.paths = [ new Phaser.Curves.Spline(points1), new Phaser.Curves.Spline(points2), new Phaser.Curves.Spline(points3) ];
        
        this.inimigos = this.physics.add.group({ classType: Inimigo, runChildUpdate: true });
        this.arqueiros = this.add.group();
        this.flechas = this.physics.add.group();
        
        this.waveText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '80px', fontFamily: 'Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setDepth(200);
        
        this.physics.add.overlap(this.flechas, this.inimigos, this.acertouInimigo, null, this);
        
        this.waveText.setText('Nova horda a caminho...');
        this.time.delayedCall(2500, () => {
            this.startNextWave();
        });

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
        
        this.input.on('pointerdown', (pointer) => {
            console.log(`x: ${Math.round(pointer.x)}, y: ${Math.round(pointer.y)}`);
        });
    }

    update(time, delta) {
        this.inimigos.getChildren().forEach(inimigo => {
            if (inimigo.active && inimigo.pathTween) {
                if (inimigo.pathTween.progress === 1) {
                    this.inimigoAlcancouObjetivo(inimigo);
                }
            }
        });

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

        for (let i = 1; i <= 4; i++) {
            this.anims.create({
                key: `anim_citizen_${i}`,
                frames: this.anims.generateFrameNumbers(`citizen_${i}`, { start: 0, end: 3 }),
                frameRate: 5,
                repeat: -1
            });
        }
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
        
        const difficultyLevel = this.currentWave + 5;
        const waveConfig = this.waveGenerator.generateWave(difficultyLevel);
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
        const chosenPath = this.paths[Phaser.Math.Between(0, this.paths.length - 1)];
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
        this.events.emit('gameWin', null); 
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
