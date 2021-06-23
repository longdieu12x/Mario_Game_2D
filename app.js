// import functions and variables //
import { maps } from "./maps/map.js";
import  { MOVE_SPEED, JUMP_FORCE, BIG_JUMP_FORCE, FALL_DEATH, ENEMY_SPEED}  from "./variables/variables.js";
import { loadSpriteMario } from './sprites_functionalities/functionalities.js';
//-----------------------------------------------------//
kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
});
class Evil {
    constructor(name, speed){
        this.name = name;
        this.speed = speed;
    }
    
    move(){
        action(this.name, (e) => {
            e.move(this.speed , 0);
        })
    }
}
let CURRENT_JUMP_FORCE = JUMP_FORCE;
let isJumping = true;
loadSpriteMario();
scene("game", ({ level, score }) => {
    //Declare bg as a bottom background, ui as a top background
    layers(['bg', 'obj', 'ui'], 'obj');

    //declar big function
    function big() {
        let timer = 0;
        let isBig = false;
        return {
        update() {
            if (isBig) {
            CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
            timer -= dt();
            if (timer <= 0) {
                this.smallify();
            }
            }
        },
        isBig() {
            return isBig;
        },
        smallify() {
            this.scale = vec2(1);
            CURRENT_JUMP_FORCE = JUMP_FORCE;
            timer = 0;
            isBig = false;
        },
        biggify(time) {
            this.scale = vec2(2);
            timer = time;
            isBig = true;     
        }
        }
    };

    // import variables spritees
    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('evil-shroom'), solid(), 'dangerous'],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '£': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)],
    };

    // Add level and Point on UI background
    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
        value: score,
        }
    ]);
    add([text('level ' + parseInt(level + 1) ), pos(40, 6)]);

    //add sprites to backgground 
    const gameLevel = addLevel(maps[level], levelCfg);

    // player function
    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(CURRENT_JUMP_FORCE),
        origin('bot')
    ])

    // hit to take coin
    player.on("headbump", (obj) => {
        if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0,0));
        }
        if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0,0));
        }
    })

    // collide
    player.collides('mushroom', (m) => {
        destroy(m);
        player.biggify(6);
    })

    player.collides('coin', (c) => {
        destroy(c);
        scoreLabel.value++;
        scoreLabel.text = scoreLabel.value;
    })
    player.collides('dangerous', (d) => {
        if (isJumping) {
        destroy(d);
        } else {
        go('lose', { score: scoreLabel.value});
        }
    })
    player.collides('pipe', () => {
        keyPress('down', () => {
        go('game', {
            level: (level + 1) % maps.length,
            score: scoreLabel.value
        })
        })
    })

    // jump to kill enemy
    player.action(() => {
        camPos(player.pos);
        if (player.pos.y >= FALL_DEATH) {
        go('lose', { score: scoreLabel.value});
        }
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0);
    });

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0);
    });

    player.action(() => {
        if(player.grounded()) {
        isJumping = false;
        }
    });

    keyPress('space', () => {
        if (player.grounded()) {
        isJumping = true;
        player.jump(CURRENT_JUMP_FORCE);
        }
    });

    // mushroom
    let mushroom = new Evil('mushroom', ENEMY_SPEED);
    mushroom.move();
    let dangerous = new Evil('dangerous', -ENEMY_SPEED);
    dangerous.move();
})
    
    //lose scene
scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)]);
})

start("game", { level: 0, score: 0})


