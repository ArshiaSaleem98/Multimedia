// Declare all the commonly used objects as variables for convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var gamelevels = [];/* this array will contains the next level we have finished + 1 (newly added)*/
var musicList = ['/audio/optionalMusic1', '/audio/optionalMusic2', '/audio/optionalMusic3', '/audio/optionalMusic4', '/audio/optionalMusic5', '/audio/optionalMusic6'];/*music list options for user to chnage the background music*/


(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());
//
var game = {

    init: function () {
        // Initialize the object
        levels.init();
        loader.init();
        mouse.init();
        game.backgroundMusic = loader.loadSound('/audio/music1General')
        game.slingshotReleaseSound = loader.loadSound('/audio/release');
        game.bounceSound = loader.loadSound('/audio/boing');
        game.breakSound = {
            "glass": loader.loadSound('/audio/brokenglass'),
            "wood": loader.loadSound('/audio/breakingwood')
        };
        $('.gamelayer').hide();
        $('#gamestartscreen').show();
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');
    },
    showLevelScreen: function () {
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },


    showSettings: function () {/*main screen setting button implementation, to change the background music*/
        $('.gamelayer').hide();
        $('#settings').show('slow');
        $('#settings1').show('slow');

        var html = "";
        var html1 = "";

        html1 += '<span > Change Background Music </span> ';
        html1 += '<button id="playSound" class="btn btn-primary"></button> ';

        for (var i = 1; i < musicList.length + 1; i++) {/*it will create as much inputs and button(play , stop and select)  as we have music options...moreover the user for each music will able to listen the music, stop and select in case if he/She likes the music (newly added )*/
            html += '<input type="button" id="blocked" value="' + i + '" disabled> '
            html += '<button  value="' + i + '"  id="playSound"><i class="fa fa-play"></i></button>'
            html += '<button  value="' + i + '"  id="stopSound"><i class="fa fa-stop"></i></button>'
            html += '<button  value="' + i + '"  id="selectSound"><i class="fa fa-check"></i></button>'
        }
        lengths = musicList.length
        $('#settings1').html(html);
        $('#settings').html(html1);

        $('#settings1 #playSound').click(function () {/*implementation of playSound button , it will play the clicked music (newly added )*/
            for (var i = 0; i < lengths; i++) {
                if (this.value - 1 == i) {
                    audio = new Audio(musicList[i] + '.ogg');
                    audio.play();
                }
            }
        });
        $('#settings1 #stopSound').click(function () {/*implementation of stopSound button , it will stop the corresponding music (newly added )*/
            audio.pause();

        });

        $('#settings1 #selectSound').click(function () {/*implementation of selectSound button , whenever the user will click on this button, background will be changed  (newly added )*/
            for (var i = 0; i < lengths; i++) {
                if (this.value - 1 == i) {
                    game.backgroundMusic = loader.loadSound(musicList[i]);
                    alert("Successfully Changed");
                    $('#settings1').hide();
                    $('#settings').hide();
                    $('#gamestartscreen').show();

                }
            }

        });

        $('#settings button').click(function () {/*implementation of Cancel button , it will close the setting div  (newly added )*/
            $('#settings1').hide();
            $('#settings').hide();
            $('#gamestartscreen').show();

        });

    },


    returnLevel: function () {
        /*this method will be called from ending screen , once the level is successfully finised , in this method level function will be called to refresh the data , basically to see which levels are unblocked and which levels are not (newly added)*/
        $('.gamelayer').hide();
        levels.init();
        $('#levelselectscreen').show('slow');
    },

    startBackgroundMusic: function () {
        var toggleImage = $("#togglemusic")[0];
        game.backgroundMusic.play();
        toggleImage.src = "/images/icons/sound.png";
    },
    stopBackgroundMusic: function () {
        var toggleImage = $("#togglemusic")[0];
        toggleImage.src = "/images/icons/nosound.png";
        game.backgroundMusic.pause();
        game.backgroundMusic.currentTime = 0;
    },
    toggleBackgroundMusic: function () {
        var toggleImage = $("#togglemusic")[0];
        if (game.backgroundMusic.paused) {
            game.backgroundMusic.play();
            toggleImage.src = "/images/icons/sound.png";
        } else {
            toggleImage.src = "/images/icons/nosound.png";
            game.backgroundMusic.pause();
        }
    },
    mode: "intro",
    slingshotX: 140,
    slingshotY: 280,
    start: function () {
        $('.gamelayer').hide();
        $('#gamecanvas').show();
        $('#scorescreen').show();
        game.startBackgroundMusic();
        game.mode = "intro";
        game.offsetLeft = 0;
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    },
    maxSpeed: 3,
    minOffset: 0,
    maxOffset: 300,
    offsetLeft: 0,
    score: 0,
    panTo: function (newCenter) {
        if (Math.abs(newCenter - game.offsetLeft - game.canvas.width / 4) > 0
            && game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset) {
            var deltaX = Math.round((newCenter - game.offsetLeft - game.canvas.width / 4) / 2);
            if (deltaX && Math.abs(deltaX) > game.maxSpeed) {
                deltaX = game.maxSpeed * Math.abs(deltaX) / (deltaX);
            }
            game.offsetLeft += deltaX;
        } else {
            return true;
        }
        if (game.offsetLeft < game.minOffset) {
            game.offsetLeft = game.minOffset;
            return true;
        } else if (game.offsetLeft > game.maxOffset) {
            game.offsetLeft = game.maxOffset;
            return true;
        }
        return false;
    },
    countHeroesAndVillains: function () {
        game.heroes = [];
        game.villains = [];
        for (var body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
            var entity = body.GetUserData();
            if (entity) {
                if (entity.type == "hero") {
                    game.heroes.push(body);
                } else if (entity.type == "villain") {
                    game.villains.push(body);
                }
            }
        }
    },

    mouseOnCurrentHero: function () {
        if (!game.currentHero) {
            return false;
        }
        var position = game.currentHero.GetPosition();
        var distanceSquared = Math.pow(position.x * box2d.scale - mouse.x - game.offsetLeft, 2) + Math.pow(position.y * box2d.scale - mouse.y, 2);
        var radiusSquared = Math.pow(game.currentHero.GetUserData().radius, 2);
        return (distanceSquared <= radiusSquared);
    },

    showEndingScreen: function () {
        html = '';
        game.stopBackgroundMusic();
        if (game.mode == "level-success") {/*if user will able to complete the level successfully , in the ending screen he/she will able to see total score of corresponding level (newly added )*/
            if (game.currentLevel.number < levels.data.length - 1) {
                $('#endingmessage').html('Successfully Level Completed.Congratulations!!!');
                $('#playnextlevel').show();
                html += '<span>Score Card</span>';
                html += '<img src="/images/icons/score.png" >';
                html += '<p>Your Score:' + game.score + '</p>';
                $('#scoreCard').html(html);
                $('#scoreCard').show();
            } else {
                $('#endingmessage').html('Good Job. All levels Completed !!!');
                $('#playnextlevel').show();
                html += '<span>Score Card</span>';
                html += '<img src="/images/icons/score.png" >';
                html += '<p>Your Score:' + game.score + '</p>';
                $('#scoreCard').html(html);
                $('#scoreCard').show();
            }
        } else if (game.mode == "level-failure") {
            $('#endingmessage').html('Game Over,Try Again?');
            $('#playnextlevel').show();

        }
        $('#endingscreen').show();

    },
    handlePanning: function () {
        if (game.mode == "intro") {
            if (game.panTo(700)) {
                game.mode = "load-next-hero";
            }
        }
        if (game.mode == "load-next-hero") {
            game.countHeroesAndVillains();
            if (game.villains.length == 0) {
                game.mode = "level-success";
                return;
            }
            if (game.heroes.length == 0) {
                game.mode = "level-failure";
                return;
            }
            if (!game.currentHero) {
                game.currentHero = game.heroes[game.heroes.length - 1];
                game.currentHero.SetPosition({ x: 180 / box2d.scale, y: 200 / box2d.scale });
                game.currentHero.SetLinearVelocity({ x: 0, y: 0 });
                game.currentHero.SetAngularVelocity(0);
                game.currentHero.SetAwake(true);
            } else {
                game.panTo(game.slingshotX);
                if (!game.currentHero.IsAwake()) {
                    game.mode = "wait-for-firing";
                }
            }
        }
        if (game.mode == "wait-for-firing") {
            if (mouse.dragging) {
                if (game.mouseOnCurrentHero()) {
                    game.mode = "firing";
                } else {
                    game.panTo(mouse.x + game.offsetLeft);
                }
            } else {
                game.panTo(game.slingshotX);
            }
        }
        if (game.mode == "firing") {
            if (mouse.down) {
                game.panTo(game.slingshotX);
                game.currentHero.SetPosition({
                    x: (mouse.x + game.offsetLeft) / box2d.scale,
                    y: mouse.y / box2d.scale
                });
            } else {
                game.mode = "fired";
                game.slingshotReleaseSound.play();
                var impulseScaleFactor = 0.75;
                var impulse = new b2Vec2((game.slingshotX + 35 - mouse.x - game.offsetLeft) *
                    impulseScaleFactor, (game.slingshotY + 25 - mouse.y) * impulseScaleFactor);
                game.currentHero.ApplyImpulse(impulse, game.currentHero.GetWorldCenter());
            }
        }
        if (game.mode == "fired") {
            var heroX = game.currentHero.GetPosition().x * box2d.scale;
            game.panTo(heroX);
            if (!game.currentHero.IsAwake() || heroX < 0
                || heroX > game.currentLevel.foregroundImage.width) {
                box2d.world.DestroyBody(game.currentHero);
                game.currentHero = undefined;
                game.mode = "load-next-hero";
            }
        }
        if (game.mode == "level-failure") {
            if (game.panTo(0)) {
                game.ended = true;
                game.showEndingScreen();
            }
        }
        if (game.mode == "level-success") /*only if user has completed the level successfully */ {
            if (game.panTo(0)) {
                game.ended = true;
                gamelevels.push(game.currentLevel['number'] + 1);/*on gamelevel array we will add the currentlevel that we have finished +1 ,it will help us to unblock the next level(newly added)*/
                game.showEndingScreen();
            }
        }
    },

    animate: function () {

        game.handlePanning();
        var currentTime = new Date().getTime();
        var timeStep;
        if (game.lastUpdateTime) {
            timeStep = (currentTime - game.lastUpdateTime) / 1000;
            box2d.step(timeStep);
        }
        game.lastUpdateTime = currentTime;


        game.context.drawImage(game.currentLevel.backgroundImage,
            game.offsetLeft / 4, 0, 640, 480, 0, 0, 640, 480);
        game.context.drawImage(game.currentLevel.foregroundImage,
            game.offsetLeft, 0, 640, 480, 0, 0, 640, 480);
        game.context.drawImage(game.slingshotImage, game.slingshotX -
            game.offsetLeft, game.slingshotY);
        game.drawAllBodies();
        if (game.mode == "firing") {
            game.drawSlingshotBand();
        }
        game.context.drawImage(game.slingshotFrontImage, game.slingshotX -
            game.offsetLeft, game.slingshotY);
        if (!game.ended) {
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    },
    drawSlingshotBand: function () {
        game.context.strokeStyle = "rgb(68, 31, 11)"; //Dark brown
        game.context.lineWidth = 6; //
        var radius = game.currentHero.GetUserData().radius;
        var heroX = game.currentHero.GetPosition().x * box2d.scale;
        var heroY = game.currentHero.GetPosition().y * box2d.scale;
        var angle = Math.atan2(game.slingshotY + 25 - heroY, game.slingshotX + 50 - heroX);

        var heroFarEdgeX = heroX - radius * Math.cos(angle);
        var heroFarEdgeY = heroY - radius * Math.cos(angle);
        game.context.beginPath();
        game.context.moveTo(game.slingshotX + 50 - game.offsetLeft, game.slingshotY + 25);
        game.context.lineTo(heroX - game.offsetLeft, heroY);
        game.context.stroke();
        entities.draw(game.currentHero.GetUserData(), game.currentHero.GetPosition(),
            game.currentHero.GetAngle());
        game.context.beginPath();
        game.context.moveTo(heroFarEdgeX - game.offsetLeft, heroFarEdgeY + 25);
        game.context.lineTo(game.slingshotX - game.offsetLeft + 10, game.slingshotY + 30);
        game.context.stroke();
    },
    restartLevel: function () {
        window.cancelAnimationFrame(game.animationFrame);
        game.lastUpdateTime = undefined;
        levels.load(game.currentLevel.number);
    },
    startNextLevel: function () {
        window.cancelAnimationFrame(game.animationFrame);
        game.lastUpdateTime = undefined;
        levels.load(game.currentLevel.number + 1);
    },
    drawAllBodies: function () {
        box2d.world.DrawDebugData();
        for (var body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
            var entity = body.GetUserData();
            if (entity) {
                var entityX = body.GetPosition().x * box2d.scale;
                if (entityX < 0 || entityX > game.currentLevel.foregroundImage.width ||
                    (entity.health && entity.health < 0)) {
                    box2d.world.DestroyBody(body);
                    if (entity.type == "villain") {
                        game.score += entity.calories;
                        $('#score').html('Score: ' + game.score);
                    }
                    if (entity.breakSound) {
                        entity.breakSound.play();
                    }
                } else {
                    entities.draw(entity, body.GetPosition(), body.GetAngle());
                }
            }
        }
    },
}
$(window).load(function () {
    game.init();
});
// level
var levels = {
    data: [
        
        {   //first round 
           foreground: 'desert-foreground',
           background: 'clouds-background',
           entities: [
               { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20, isStatic: true },
               { type: "ground", name: "wood", x: 185, y: 390, width: 30, height: 80, isStatic: true },
               { type: "block", name: "wood", x: 520, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 520, y: 280, angle: 90, width: 100, height: 25 },
               { type: "villain", name: "villain1", x: 520, y: 185, calories: 590 },
               { type: "block", name: "wood", x: 620, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 620, y: 280, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 570, y:200, width: 135, height: 25 },
               { type: "villain", name: "villain1", x: 620, y: 185, calories: 420 },
               { type: "hero", name: "hero1", x: 80, y: 405 },
               { type: "hero", name: "hero2", x: 140, y: 405 },
           ]
       },
       {//Second level
           foreground: 'desert-foreground',
           background: 'clouds-background',
           entities: [
               { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20, isStatic: true },
               { type: "ground", name: "wood", x: 185, y: 390, width: 30, height: 80, isStatic: true },
                 
               { type: "block", name: "wood", x: 520, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 570, y: 317.5, width: 124, height: 25 },
               { type: "block", name: "wood", x: 620, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "wood", x: 520, y: 250, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 570, y:200, width: 124, height: 25 },
               { type: "block", name: "wood", x: 620, y: 250, angle: 90, width: 100, height: 25 },

               { type: "block", name: "wood", x: 680, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 730, y: 317.5, width: 124, height: 25 },
               { type: "block", name: "wood", x: 780, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "wood", x: 680, y: 250, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 730, y:200, width: 124, height: 25 },
               { type: "block", name: "wood", x: 780, y: 250, angle: 90, width: 100, height: 25 },

               { type: "villain", name: "villain2", x: 570, y: 405, calories: 420 },
               { type: "villain", name: "villain2", x: 570, y: 280, calories: 420 },
               { type: "villain", name: "villain2", x: 730, y: 280, calories: 420 },
               { type: "villain", name: "villain2", x: 730, y: 405, calories: 420 },
               { type: "villain", name: "villain5", x: 570, y: 155, calories: 420 },
               { type: "villain", name: "villain6", x: 730, y: 155, calories: 420 },

               { type: "hero", name: "hero3", x: 30, y: 415 },
               { type: "hero", name: "hero4", x: 80, y: 405 },
               { type: "hero", name: "hero5", x: 140, y: 405 },
           ]
       },
       
       {//third level
           foreground: 'desert-foreground',
           background: 'clouds-background',
           entities: [
               { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20, isStatic: true },
               { type: "ground", name: "wood", x: 185, y: 390, width: 30, height: 80, isStatic: true },

               { type: "block", name: "wood", x: 520, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 570, y: 317.5, width: 105, height: 25 },
               { type: "block", name: "wood", x: 620, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 670, y: 317.5, width: 105, height: 25 },
               { type: "block", name: "wood", x: 720, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 770, y: 317.5, width: 105, height: 25 },
               { type: "block", name: "wood", x: 820, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 870, y: 317.5, width: 105, height: 25 },
               { type: "block", name: "wood", x: 920, y: 380, angle: 90, width: 100, height: 25 },

               { type: "block", name: "wood", x: 670, y: 300, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 720, y: 200, width: 400, height: 25 },
               { type: "block", name: "wood", x: 770, y: 300, angle: 90, width: 100, height: 25 },

               { type: "villain", name: "villain1", x:570, y: 405, calories: 590 },
               { type: "villain", name: "villain2", x:670, y: 405, calories: 590 },
               { type: "villain", name: "villain1", x:770, y: 405, calories: 590 },
               { type: "villain", name: "villain2", x:870, y: 405, calories: 590 },
               { type: "villain", name: "villain5", x:720, y: 280, calories: 590 },
               { type: "villain", name: "villain6", x:570, y: 280, calories: 590 },
               { type: "villain", name: "villain7", x:870, y: 280, calories: 590 },
               { type: "villain", name: "villain2", x:720, y: 160, calories: 590 },

               { type: "hero", name: "hero6", x: 30, y: 415 },
               { type: "hero", name: "hero7", x: 80, y: 405 },
               { type: "hero", name: "hero8", x: 140, y: 405 },
           ]
       },
       

       {//forth level
           foreground: 'desert-foreground',
           background: 'clouds-background',
           entities: [
               { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20, isStatic: true },
               { type: "ground", name: "wood", x: 185, y: 390, width: 30, height: 80, isStatic: true },

              

               { type: "block", name: "wood", x: 490, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 540, y: 317.5, width: 100, height: 25 },
               { type: "villain", name: "villain2", x: 540, y: 405, calories: 590 },
               { type: "block", name: "wood", x: 590, y: 380, angle: 90, width: 100, height: 25 },

               { type: "block", name: "wood", x: 620, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 670, y: 317.5, width: 100, height: 25 },
               { type: "villain", name: "villain7", x: 670, y: 405, calories: 590 },
               { type: "block", name: "wood", x: 720, y: 380, angle: 90, width: 100, height: 25 },

               { type: "block", name: "wood", x: 750, y: 380, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 800, y: 317.5, width: 100, height: 25 },
               { type: "villain", name: "villain3", x: 800, y: 405, calories: 590 },
               { type: "block", name: "wood", x: 850, y: 380, angle: 90, width: 100, height: 25 },


               {type: "block", name: "glass", x: 550, y: 260, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 650, y: 260, angle: 90, width: 100, height: 25 },
               { type: "villain", name: "villain5", x:520, y: 280, calories: 590 },
               { type: "block", name: "wood", x: 600, y: 195.5, width: 100, height: 25 },

               {type: "block", name: "glass", x: 690, y: 260, angle: 90, width: 100, height: 25 },
               { type: "block", name: "wood", x: 740, y: 195.5, width: 100, height: 25 },
               {type: "block", name: "glass", x: 790, y: 260, angle: 90, width: 100, height: 25 },
               { type: "villain", name: "villain6", x:810, y: 280, calories: 590 },


               {type: "block", name: "wood", x: 620, y: 135, angle: 90, width: 100, height: 25 },
               { type: "block", name: "glass", x: 670, y: 68, width: 100, height: 25 },
               {type: "block", name: "wood", x: 720, y: 135, angle: 90, width: 100, height: 25 },
               { type: "villain", name: "villain8", x:670, y: 42, calories: 590 },


               { type: "hero", name: "hero7", x: 30, y: 415 },
               { type: "hero", name: "hero8", x: 80, y: 405 },
               { type: "hero", name: "hero9", x: 140, y: 405 },
           ]
        },
    ],
    init: function () {
        var html = "";
        html += '<span >Levels</span> ';/* gave heading level select screen*/

        for (var i = 0; i < levels.data.length; i++) {


            var level = levels.data[i];
            if (i != 0) {/*if i=0 which means its not level 1 then we will check the gamelevels array to see if we have finished the currentlevel to unblock the next level if not then the user cant access the next level, and it will show the unblock image(newly added)*/
                if (gamelevels.includes(i)) {
                    html += '<input type="button" value="' + (i + 1) + '">';
                } else {
                    html += '<input type="button" id="blocked" value="' + (i + 1) + '" disabled="disabled">'/*it is blocked level, not clickable (newly added)*/
                }
            } else {/*else i=0 then it is level one , and it will always be showed as unblocked (newly added)*/
                html += '<input type="button" value="' + (i + 1) + '">';
            }
        };
        $('#levelselectscreen').html(html);
        $('#levelselectscreen input').click(function () {
            levels.load(this.value - 1);
            $('#levelselectscreen').hide();
        });
    },
    load: function (number) {
        box2d.init();//
        game.currentLevel = { number: number, hero: [] };
        game.score = 0;
        $('#score').html('Score: ' + game.score);
        game.currentHero = undefined;
        var level = levels.data[number];
        game.currentLevel.backgroundImage = loader.loadImage("/images/backgrounds/" + level.background + ".png");
        game.currentLevel.foregroundImage = loader.loadImage("/images/backgrounds/" + level.foreground + ".png");
        game.slingshotImage = loader.loadImage("/images/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("/images/slingshot-front.png");
        for (var i = level.entities.length - 1; i >= 0; i--) {
            var entity = level.entities[i];
            entities.create(entity);
        };
        if (loader.loaded) {
            game.start();
        } else {
            loader.onload = game.start;
        }
    }
}
//
var entities = {
    definitions: {
        "glass": {
            fullHealth: 100,
            density: 2.4,
            friction: 0.4,
            restitution: 0.15,
        },
        "wood": {
            fullHealth: 500,
            density: 0.7,
            friction: 0.4,
            restitution: 0.4,
        },
        "dirt": {
            density: 3.0,
            friction: 1.5,
            restitution: 0.2,
        },
        "villain1": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain2": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain3": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain4": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain5": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain6": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain7": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "villain8": {/* new villain added (newly added)*/ 
            shape: "rectangle",
            fullHealth: 80,
            width: 40,
            height: 60,
            density: 1,
            friction: 0.5,
            restitution: 0.7,
        },
        "hero1": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero2": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero3": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero4": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero5": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero6": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero7": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero8": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
        "hero9": {/*new heroes added (newly added)*/
            shape: "circle",
            radius: 25,
            density: 1.5,
            friction: 0.5,
            restitution: 0.4,
        },
    },
    create: function (entity) {
        var definition = entities.definitions[entity.name];
        if (!definition) {
            console.log("undefined entity name", entity.name);
            return;
        }
        switch (entity.type) {
            case "block": //simple rectangle
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.shape = "rectangle";
                entity.sprite = loader.loadImage("/images/entities/"
                    + entity.name + ".png");
                entity.breakSound = game.breakSound[entity.name];
                box2d.createRectangle(entity, definition);
                break;
            case "ground": //Simple rectangle
                entity.shape = "rectangle";
                box2d.createRectangle(entity, definition);
                break;
            case "hero":
            case "villain":
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.sprite = loader.loadImage("/images/entities/"
                    + entity.name + ".png");
                entity.shape = definition.shape;
                entity.bounceSound = game.bounceSound;
                if (definition.shape == "circle") {
                    entity.radius = definition.radius;
                    box2d.createCircle(entity, definition);
                } else if (definition.shape == "rectangle") {
                    entity.width = definition.width;
                    entity.height = definition.height;
                    box2d.createRectangle(entity, definition);
                }
                break;
            default:
                console.log("Undefined entity type", entity.type);
                break;
        }
    },
    draw: function (entity, position, angle) {
        game.context.translate(position.x * box2d.scale - game.offsetLeft,
            position.y * box2d.scale);
        game.context.rotate(angle);
        switch (entity.type) {
            case "block":
                game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width,
                    entity.sprite.height, -entity.width / 2 - 1, -entity.height / 2 - 1,
                    entity.width + 2, entity.height + 2);
                break;
            case "villain":
            case "hero":
                if (entity.shape == "circle") {
                    game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width,
                        entity.sprite.height, -entity.radius - 1, -entity.radius - 1,
                        entity.radius * 2 + 2, entity.radius * 2 + 2);
                } else if (entity.shape == "rectangle") {
                    game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width,
                        entity.sprite.height, -entity.width / 2 - 1, -entity.height / 2 - 1,
                        entity.width + 2, entity.height + 2);
                }
                break;
            case "ground":
                break;
        }
        game.context.rotate(-angle);
        game.context.translate(-position.x * box2d.scale + game.offsetLeft, -position.y * box2d.scale);
    },
}
//Create box2d object
var box2d = {
    scale: 30,
    init: function () {
        var gravity = new b2Vec2(0, 9.8);
        var allowSleep = true;
        box2d.world = new b2World(gravity, allowSleep);
        var debugContext = document.getElementById('debugcanvas').getContext('2d');
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugContext);
        debugDraw.SetDrawScale(box2d.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        box2d.world.SetDebugDraw(debugDraw);
        var listener = new Box2D.Dynamics.b2ContactListener;
        listener.PostSolve = function (contact, impulse) {
            var body1 = contact.GetFixtureA().GetBody();
            var body2 = contact.GetFixtureB().GetBody();
            var entity1 = body1.GetUserData();
            var entity2 = body2.GetUserData();
            var impulseAlongNormal = Math.abs(impulse.normalImpulses[0]);

            if (impulseAlongNormal > 5) {
                if (entity1.health) {
                    entity1.health -= impulseAlongNormal;
                }
                if (entity2.health) {
                    entity2.health -= impulseAlongNormal;
                }
                if (entity1.bounceSound) {
                    entity1.bounceSound.play();
                }
                if (entity2.bounceSound) {
                    entity2.bounceSound.play();
                }
            }
        };
        box2d.world.SetContactListener(listener);
    },
    step: function (timeStep) {
        if (timeStep > 2 / 60) {
            timeStep = 2 / 60;
        }
        box2d.world.Step(timeStep, 8, 3);
    },
    createRectangle: function (entity, definition) {
        var bodyDef = new b2BodyDef;
        if (entity.isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        bodyDef.position.x = entity.x / box2d.scale;
        bodyDef.position.y = entity.y / box2d.scale;
        if (entity.angle) {
            bodyDef.angle = Math.PI * entity.angle / 180;
        }
        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;
        fixtureDef.shape = new b2PolygonShape;
        fixtureDef.shape.SetAsBox(entity.width / 2 / box2d.scale,
            entity.height / 2 / box2d.scale);

        var body = box2d.world.CreateBody(bodyDef);
        body.SetUserData(entity);
        var fixture = body.CreateFixture(fixtureDef);
        return body;
    },
    createCircle: function (entity, definition) {
        var bodyDef = new b2BodyDef;
        if (entity.isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        bodyDef.position.x = entity.x / box2d.scale;
        bodyDef.position.y = entity.y / box2d.scale;
        if (entity.angle) {
            bodyDef.angle = Math.PI * entity.angle / 180;
        }
        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;
        fixtureDef.shape = new b2CircleShape(entity.radius / box2d.scale);

        var body = box2d.world.CreateBody(bodyDef);
        body.SetUserData(entity);
        var fixture = body.CreateFixture(fixtureDef);
        return body;
    },
}

var loader = {
    loaded: true,
    loadedCount: 0,
    totalCount: 0,

    init: function () {
        var mp3Support, oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            // 
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
        } else {
            mp3Support = false;
            oggSupport = false;
        }
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
        console.log(loader.soundFileExtn);
    },
    loadImage: function (url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },
    soundFileExtn: ".ogg",
    loadSound: function (url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url + loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },
    itemLoaded: function () {
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded ' + loader.loadedCount + ' of ' + loader.totalCount);
        if (loader.loadedCount === loader.totalCount) {
            loader.loaded = true;
            $('#loadingscreen').hide();
            if (loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}
//Handle mouse events
var mouse = {
    x: 0,
    y: 0,
    down: false,
    init: function () {
        $('#gamecanvas').mousemove(mouse.mousemovehandler);
        $('#gamecanvas').mousedown(mouse.mousedownhandler);
        $('#gamecanvas').mouseup(mouse.mouseuphandler);
        $('#gamecanvas').mouseout(mouse.mouseuphandler);
    },
    mousemovehandler: function (ev) {
        var offset = $('#gamecanvas').offset();
        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;
        if (mouse.down) {
            mouse.dragging = true;
        }
    },
    mousedownhandler: function (ev) {
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
    },
    mouseuphandler: function (ev) {
        mouse.down = false;
        mouse.dragging = false;
    }
}

