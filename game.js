var canvas = document.getElementById(`canvas`);
var ctx = canvas.getContext('2d');
var rect = canvas.getBoundingClientRect();
canvas.width = 1024
canvas.height = 768
var weedsLS

function pushFx(fx) {
    var audio = new Audio(fx)
    audio.volume = settings[3]/10
    audio.play();
}

class Particle {
    constructor(x, y, color) {
        this.pos = {x:x, y:y}
        this.direction = Math.random() * Math.PI * 2
        this.radius = Math.random() * canvas.height*0.05
        this.color = color
    }

    draw() {
        ctx.strokeStyle = "black"
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        this.pos.x += Math.cos(this.direction) * (editMode ? canvas.width/5000 : canvas.width/500)
        this.pos.y += Math.sin(this.direction) * (editMode ? canvas.width/5000 : canvas.width/500)
        this.radius *= editMode ? 0.99 : 0.9
    }
}
class Flower {
    constructor(x, y, growth, newInst=true, cost=flowerCost) {
        this.pos = {
            x: x,
            y: y
        }
        this.growth = growth
        this.color = `hsl(${Math.random()*255}, 50%, 50%)`
        this.cost = cost
        if (newInst) {
            flowerCost = Math.round(flowerCost*2.5)
            localStorage.fC = flowerCost
        }

        this.justCreated = newInst
        this.autoed = false
    }
}

class Weed {
    constructor(x, y) {
        this.pos = {
            x:x, 
            y:y
        }
    }
}

class Message {
    constructor(text, type) {
        this.text = text
        this.time = frame
        this.type = type
    }
}

class Golem {
    constructor(x, y, newInst=true, cost=autoCosts[0], freq=200, range=canvas.width/35, uC=0) {
        this.pos = {x:x, y:y}
        this.freq = freq
        this.speed = canvas.height/100
        this.range = range
        this.last = frame
        this.cost = cost
        if (newInst) {
            autoCosts[0] = Math.round(autoCosts[0]*1.25)
            localStorage.aC = `${autoCosts[0]},${autoCosts[1]},${autoCosts[2]}`
            pushFx("auto.wav")
        }
        this.direction = 1
        this.phase = 0
        this.upgradeCount = uC
        this.type = "golem"
    }

    draw() {
        if (this.pos.y <= margin*canvas.width/rows || this.pos.y >= canvas.height - margin*canvas.width/rows) {
            this.direction *= -1
        }
        this.pos.y -= this.direction*this.speed*(editMode ? 0.1 : 1)
        ctx.fillStyle = "rgb(150, 225, 150)"
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.range, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y - this.direction*this.range*0.6, this.range*0.4, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y - this.direction*this.range*0.8, this.range*0.2, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        if (frame - this.last >= this.freq*(editMode ? 10 : 1)) {
            if (this.phase == 0) {
                if (points >= flowerCost) {
                    clear = true
                    flowers.forEach((flower, index) => {
                        if ((flower.pos.x - this.pos.x)**2 + (flower.pos.y - this.pos.y)**2 <= (flower.growth*fR/10 * 6)**2) {
                            clear = false
                        }
                    })
    
                    if (clear) {
                        x = new Flower(this.pos.x, this.pos.y, 1)
                        x.autoed = true
                        flowers.push(x)
                        saveFlowers()
                        this.last = frame
                        this.phase = 1
                    }
                }
            } else {
                flowers.forEach((flower, index) => {
                    if ((flower.pos.x - this.pos.x)**2 + (flower.pos.y - this.pos.y)**2 <= (flower.growth*fR/10 * 6 + this.range)**2 && flower.growth >= flowerThresh) {
                        flowers.splice(index, 1)
                        flowersPicked += 1
                        localStorage.fP = flowersPicked
                        if (settings[2]) {
                            for (i = 0; i<50; i++) {
                                particles.push(new Particle(flower.pos.x, flower.pos.y, "rgba(150, 255, 150)"))
                            }
                        }
                        this.last = frame
                        this.phase = 0
                        saveFlowers()
                    }
                })
            }
            if (frame - this.last >= 3*this.freq*(editMode ? 10 : 1)) {
                this.phase = this.phase == 0 ? 1 : 0
            }
        }
    }
}

class Ghost {
    constructor(x, y, newInst=true, cost=autoCosts[2], freq=200, range=canvas.width/35, uC=0) {
        this.pos = {x:x, y:y}
        this.freq = freq
        this.speed = canvas.height/100
        this.range = range
        this.last = frame
        this.cost = cost
        if (newInst) {
            autoCosts[2] = Math.round(autoCosts[2]*1.25)
            localStorage.aC = `${autoCosts[0]},${autoCosts[1]},${autoCosts[2]}`
            pushFx("auto.wav")
        }       
        this.direction = 1
        this.upgradeCount = uC
        this.type = "ghost"
    }

    draw() {
        if (this.pos.y <= margin*canvas.width/rows || this.pos.y >= canvas.height - margin*canvas.width/rows) {
            this.direction *= -1
        }
        this.pos.y -= this.direction*this.speed*(editMode ? 0.1 : 1)
        ctx.fillStyle = "rgba(200, 200, 255)"
        ctx.strokeStyle = "black"
        roundRect(this.pos.x - this.range/2, this.pos.y - this.range, this.range, this.range*2)
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y - this.direction*this.range*0.8, this.range*0.2, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y - this.direction*this.range*0.8, this.range*0.1, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        if (frame - this.last >= this.freq*(editMode ? 10 : 1)) {
            clear = false
            weeds.forEach((weed, index) => {
                if ((weed.pos.x - this.pos.x)**2 + (weed.pos.y - this.pos.y)**2 <= (fR + this.range)**2 && !clear) {
                    clear = true
                    weeds.splice(index, 1)
                    saveWeeds()
                    setTimeout(() => {
                        weedsLS = ""
                        weeds.forEach((weed) => {
                            weedsLS += weed.pos.x.toString() + "," + weed.pos.y.toString()
                        })
                    }, 100)
                    if (settings[2]) {
                        for (i = 0; i<50; i++) {
                            particles.push(new Particle(weed.pos.x, weed.pos.y, "red"))
                        }
                    }
                }
            })

            if (clear) {
                this.last = frame
                points += 1
                localStorage.points = points
            }
        }
    }
}

class Cloud {
    constructor(x, y, newInst=true, cost=autoCosts[1], freq=100, range=canvas.width/35, uC=0) {
        this.pos = {x:x, y:y}
        this.freq = freq
        this.range = range
        this.last = frame
        this.cost = cost
        if (newInst) {
            autoCosts[1] = Math.round(autoCosts[1]*1.25)
            localStorage.aC = `${autoCosts[0]},${autoCosts[1]},${autoCosts[2]}`
            pushFx("auto.wav")
        }
        this.upgradeCount = uC
        this.type = "cloud"
    }

    draw() {
        ctx.strokeStyle = "black"

        ctx.fillStyle = "rgba(225, 225, 225, 0.5)"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y - this.range*0.6, this.range*0.4, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = "rgba(150, 150, 150, 0.8)"
        ctx.beginPath()
        ctx.arc(this.pos.x-this.range*0.4, this.pos.y, this.range*0.4, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = "rgba(50, 50, 50, 0.3)"
        ctx.beginPath()
        ctx.arc(this.pos.x+this.range*0.4, this.pos.y, this.range*0.4, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = "rgba(55, 55, 15, 1)"
        ctx.beginPath()
        ctx.moveTo(this.pos.x, this.pos.y)
        ctx.lineTo(this.pos.x - this.range*0.4, this.pos.y + this.range)
        ctx.lineTo(this.pos.x + this.range*0.4, this.pos.y + this.range)
        ctx.lineTo(this.pos.x, this.pos.y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        if (frame - this.last >= this.freq*(editMode ? 10 : 1)) {
            clear = false
            flowers.forEach((flower, index) => {
                if ((flower.pos.x - this.pos.x)**2 + (flower.pos.y - this.pos.y)**2 <= (flower.growth*fR/10 * 6 + this.range)**2 && !clear && flower.growth < flowerThresh) {
                    clear = true
                    flower.growth += 1
                    saveFlowers()
                    if (settings[2]) {
                        for (i = 0; i<50; i++) {
                            particles.push(new Particle(flower.pos.x, flower.pos.y, "rgba(150, 150, 255)"))
                        }
                    }
                }
            })
            this.last = frame
        }
    }
}

mousePos = {
    x:0,
    y:0
}

var alt = false
var altQ = false
var enterClick = false
window.addEventListener("keydown", function(event) {
        if (event.key == "ArrowUp" || event.key == "w") {
            if (cm) {
                cmSelect = cmSelect > 0 ? cmSelect - 1 : cmRows.length - 1
            }
            if (alt) {
                altSelected = altSelected > 0 ? (altSelected - 1) : 2
            }
        } else if (event.key == "ArrowDown" || event.key == "s") {
            if (cm) {
                cmSelect = (cmSelect + 1) % cmRows.length
            }
            if (alt) {
                altSelected = (altSelected + 1) % 3
            }
        } else if (event.key == "Enter") {
            if (cm) {
                cm = false
                cmSelected = cmSelect
                enterClick = true
            }
        }
    if (event.key == "Alt") {
        alt = alt ? false : true
        altQ = true
    }

    if (event.code == "KeyQ" && altQ) {
        running = false
        credits = false
        settingsMenu = false
        cutscene = 0
        alt = false
    }

    if (event.key == " ") {
        if (cutscene == 1) {
            cutscene = 3
        } else if (cutscene == 7) {
            cutscene = 8
        } else {
            cutscene = 0
        }
        showingDialogue = -1
        dialogueX = {}
    }
})

window.addEventListener("keyup", function(event) {
    if (event.key == "Alt") {
        altQ = false
    }
})

var menuHovering = -1
window.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left)/(window.innerWidth - rect.left*2))*canvas.width
    mouseY = ((event.clientY - rect.top)/(window.innerHeight - rect.top*2))*canvas.height
    mousePos.x = mouseX
    mousePos.y = mouseY
    if (running) {
        if(Math.sqrt(mouseX**2 + mouseY**2) <= 50) {
            widget_showing = true
        } else if (widget_showing == true && Math.sqrt(mouseX**2 + mouseY**2) > 250) {
            widget_showing = false
        }
    } else {    }
});

var credits = false
var clearMenu = false
var showingDialogue = -1
window.addEventListener("click", function(event) {
    if (!enterClick) {
        var rect = canvas.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left)/(window.innerWidth - rect.left*2))*canvas.width
        mouseY = ((event.clientY - rect.top)/(window.innerHeight - rect.top*2))*canvas.height
    
        if (running) {
            altClicked = false
            clear = true
            autoClicked = false
            if (alt) {
                autos.forEach((auto, index) => {
                    if ((auto.pos.x - mouseX)**2 + (auto.pos.y - mouseY) ** 2 <= (auto.range)**2) {
                        if (altSelected == 0) {
                            points += Math.round(auto.cost*0.8 + auto.upgradeCount)
                            localStorage.points = points
                            autos.splice(index, 1)
                            pushFx("flower.wav")
                            messages.push(new Message(`+ $${Math.round(auto.cost*0.8 + auto.upgradeCount)}`, 1))
                            if (settings[2]) {
                                for (i = 0; i<50; i++) {
                                    particles.push(new Particle(mouseX, mouseY, "gray"))
                                }
                            }
                        } else if (altSelected == 1) {
                            upCost = 0
                            autos.forEach((auto) => {
                                upCost += auto.range
                            })
                            upCost = Math.round(upCost * 2) == 0 ? 59 : Math.round(upCost * 2)
                            if (points >= upCost) {
                                points -= upCost
                                pushFx("auto.wav")
                                localStorage.points = points
                                auto.range *= 1.1
                                auto.upgradeCount += 1
                                if (settings[2]) {
                                    for (i = 0; i<50; i++) {
                                        particles.push(new Particle(mouseX, mouseY, "gray"))
                                    }
                                }
                            } else {
                                messages.push(new Message("That costs too much.", 0))
                            }
                        } else if (altSelected == 2) {
                            upCost = 0
                            autos.forEach((auto) => {
                                upCost += 100/auto.freq
                            })
                            upCost = Math.round(upCost * 100) == 0 ? 50 : Math.round(upCost * 100)
                            pushFx("auto.wav")
                            auto.upgradeCount += 1
                            if (points >= upCost) {
                                points -= upCost
                                localStorage.points = points
                                auto.freq *= 0.9
                                if (settings[2]) {
                                    for (i = 0; i<50; i++) {
                                        particles.push(new Particle(mouseX, mouseY, "gray"))
                                    }
                                }
                            } else {
                                messages.push(new Message("That costs too much.", 0))
                            }
                        }
                        clear = false
                        autoClicked = true
                    }
                })
            } else {
                weedClicked = false
                flowerPicked = false
                for(i=0;i<weeds.length;i++) {
                    flowerRadius = fR
                    index = weeds.length - i - 1
                    weed = weeds[index]
                    if ((weed.pos.x - mouseX)**2 + (weed.pos.y - mouseY)**2 <= flowerRadius**2*2) {
                        weeds.splice(index, 1)
                        pushFx("weed.wav")
                        saveWeeds()
                        points += 1
                        localStorage.points = points
                        clear = false
                        weedClicked = true
                        if (localStorage.autoed != ":)" && points >= 10) {
                            cutscene = 6
                            localStorage.autoed = ":)"
                        }
                        break;
                    }
                }
    
                flowers.forEach((flower, index) => {
                    flowerRadius = flower.growth*fR/10 * 6
                    if ((flower.pos.x - mouseX)**2 + (flower.pos.y - mouseY)**2 <= flowerRadius**2*2) {
                        if (flower.growth >= flowerThresh) {
                            flowers.splice(index, 1)
                            pushFx("flower.wav")
                            flowersPicked += 1
                            localStorage.fP = flowersPicked
                            if (settings[2]) {
                                for (i = 0; i<50; i++) {
                                    particles.push(new Particle(mouseX, mouseY, "rgba(150, 255, 150)"))
                                }
                            }
                            if (flowersPicked == 1) {
                                messages.push(new Message("You picked your first flower!", 1))
                            }
                            saveFlowers()
                        } else {
                            messages.push(new Message("That flower needs to grow more.", 0))
                        }
                        clear = false
                        flowerPicked = true
                    }
                })
                if (clear) {
                    if (points >= flowerCost) {
                        points -= flowerCost
                        localStorage.points = points
                        flowers.push(new Flower(mouseX, mouseY, 1))
                        saveFlowers()
                    } else {
                        if (!cm) {
                            messages.push(new Message(["You don't have enough points.", "Ya broke you poor peasant.", "Begging for flowers? Ha!"][Math.floor(Math.random()*3)], 0))
                        }
                        cm = false
                    }
                } else {
                    if (!flowerPicked) {
                        if (weedClicked) {
                            if (settings[2]) {
                                for (i = 0; i<50; i++) {
                                    particles.push(new Particle(mouseX, mouseY, "red"))
                                }
                            }
                            if (points == 1 && flowerCost == 1) {
                                messages.push(new Message("You picked your first weed!", 1))
                                cutscene = 4
                            }
                        } else if (!altClicked && !autoClicked) {
                            messages.push(new Message((["There's already a flower there.", "Uh... can't overlap flowers...", "Stay calm and don't overlap the freaking flowers idiot!"])[Math.floor(Math.random()*3)], 0))
                        }
                    }
                }
            }
        } else if (cutscene == 0) {
            if (menuHovering == 1 && !credits && !settingsMenu && !clearMenu && !dialogueMenu) {
                running = true
            } else if (menuHovering == 1 && credits) {
                credits = false
            } else if (menuHovering == 2 && !settingsMenu && !dialogueMenu) {
                credits = true
            } else if (menuHovering == 0 && !settingsMenu && !clearMenu && !dialogueMenu) {
                settingsMenu = true
            } else if (menuHovering == 2 && settingsMenu) {
                settings[2] = settings[2] ? 0 : 1 
                localStorage.settings = `${settings[0]},${settings[1]},${settings[2]},${settings[3]}`
            } else if (menuHovering == 3 && settingsMenu) {
                settings[3] = (settings[3] + 1) % 11
                localStorage.settings = `${settings[0]},${settings[1]},${settings[2]},${settings[3]}`
                pushFx("sfx.wav")
            } else if (menuHovering == 4 && settingsMenu) {
                settingsMenu = false
            } else if (menuHovering == 0 && settingsMenu) { 
                settings[1] = settings[1] == "Luminari" ? "Verdana" : "Luminari"
                localStorage.settings = `${settings[0]},${settings[1]},${settings[2]},${settings[3]}`
            } else if (menuHovering == 1 && settingsMenu) { 
                settings[0] = settings[0] == 0.2 ? 0 : 0.2
                textHoverChange = textHoverChange == 0 ? 0.5 : 0
                textHover = 0
                localStorage.settings = `${settings[0]},${settings[1]},${settings[2]},${settings[3]}`
            } else if (menuHovering == 3 && !dialogueMenu) {
                dialogueMenu = true
            } else if (menuHovering == 0 && dialogueMenu) {
                dialogueMenu = false
                showingDialogue = -1
            } else if (menuHovering == 4 && !dialogueMenu) {
                clearMenu = true
            } else if (menuHovering == 1 && clearMenu) {
                clearMenu = false
            } else if (menuHovering == 0 && clearMenu) {
                clearMenu = false
                keys = []
                for (var i = 0; i < localStorage.length; i++) {  
                    key = localStorage.key(i)
                    if(key != "settings") {       
                        keys.push(key)
                    } 
                }
    
                keys.forEach((key) => {
                    localStorage.removeItem(key)
                })
                localStorage.resetReload = "stop being a nerd and go back to the game :|"
                window.location.reload()
            } else if (dialogueMenu) {
                showingDialogue = menuHovering - 1
            }
        }
    } else {
        enterClick = false
    }
});

window.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    var rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left)/(window.innerWidth - rect.left*2))*canvas.width
    mouseY = ((event.clientY - rect.top)/(window.innerHeight - rect.top*2))*canvas.height
    
    clear = false
    flowers.forEach((flower) => {
        flowerRadius = flower.growth*fR/10 * 6
        if ((flower.pos.x - mouseX)**2 + (flower.pos.y - mouseY)**2 <= flowerRadius**2*2) {
            clear = true
            if (flower.growth < flowerThresh) {
                if (settings[2]) {
                    for (i = 0; i<50; i++) {
                        particles.push(new Particle(mouseX, mouseY, "rgba(150, 150, 255)"))
                    }
                }
                flower.growth += 1
                saveFlowers()
                if (flowersPicked == 0 && flowers[0].growth == 2) {
                    messages.push(new Message("You watered your first flower!", 3))
                }
            }
        }
    })

    if (!clear && !cutscene) {
        cm = cm ? false : true
    }
});

function roundRect(x, y, width, height) {
    ctx.beginPath()
    ctx.arc(x + width/2, y+width/2, width/2, 0, 2*Math.PI)
    ctx.arc(x + width/2, y+height - width/2, width/2, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillRect(x, y + width/2, width, height - width)
    ctx.beginPath()
    ctx.moveTo(x, y+width/2)
    ctx.lineTo(x, y+height-width/2)
    ctx.moveTo(x+width, y+width/2)
    ctx.lineTo(x+width, y+height-width/2)
    ctx.closePath()
    ctx.stroke()
}

let dialogueX = {}
var dialogues = []
if (localStorage.dialogue) {
    for (i=0; i<localStorage.dialogue.split("|").length/2; i++) {
        dialogues.push([localStorage.dialogue.split("|")[i*2], localStorage.dialogue.split("|")[i*2 + 1]])
    }
} else {
    localStorage.dialogue = ""
}
function dialogue(title, text, x=true) {
    if (typeof(dialogueX[title]) == "undefined") {
        dialogueX[title] = 0
        if (x) {
            dialogues.push([title, text])
            localStorage.dialogue += title + "|" + text + "|"
        }
    }
    x = dialogueX[title]
    ctx.fillStyle = "rgba(150, 115, 0, 0.9)"
    y = Math.round(((1/x) * Math.sin(x))*canvas.height*0.8)
    ctx.fillRect(canvas.width*0.2, canvas.height*0.2 - y, canvas.width*0.6, canvas.height*0.6)
    ctx.strokeRect(canvas.width*0.2, canvas.height*0.2 - y, canvas.width*0.6, canvas.height*0.6)
    ctx.font = `${canvas.width/30}px ${settings[1]}`
    ctx.fillStyle = "black"
    ctx.fillText(title, canvas.width*0.225, canvas.height*0.275 - y)
    ctx.font = `${canvas.width/45}px ${settings[1]}`
    text.split("[enter]").forEach((line, i) =>  {
        if (line.startsWith("[emphasis]")) {
            ctx.fillStyle = "white"
            ctx.fillText(line.replace("[emphasis]", ""), canvas.width*0.225, canvas.height*(0.325 + 0.035*i) - y)
        } else { 
            ctx.fillStyle = "black"
            ctx.fillText(line, canvas.width*0.225, canvas.height*(0.325 + 0.035*i) - y)
        }
    })

    ctx.font = `${canvas.width/70}px ${settings[1]}`
    ctx.fillStyle = "white"
    ctx.fillText("[SPACE] to continue.", canvas.width*0.65, canvas.height*0.775 - textHover*0.5 - y)

    dialogueX[title] += 0.15
}

function blank() {

}

function intro() {
    dialogue("I miss my family...", "The plague...[enter]so fresh in my mind.[enter]But flowers can save them...")
}

function tutorialWeed() {
    dialogue("Weeding", "I must garden...[enter]There is no other choice...[enter]Force myself to weed. [enter][emphasis]Click, click, click.")
}

function tutorialFlower() {
    dialogue("Planting", "But weeds only grant me nothing![enter]They will not save my family![enter]I must plant...[enter][emphasis]Click, click, click.")
}

function tutorialWater() {
    dialogue("Watering", "Flowers are worthless this small...[enter]Water them, I must...[enter]But how?[enter]Perhaps I just need...[enter][emphasis]the RIGHT CLICK![enter][enter][emphasis]I really should visit the top left corner of my garden...")
}

function tutorialAuto() {
    dialogue("Automation", "How I thirst to use only my raw hands...[enter]But this body fails me...[enter]Perhaps some automation is in good taste...[enter]Golems for planting...[enter]Ghosts for weedings...[enter]Trees for watering...[enter][enter][emphasis]Maybe another right click over grass? [enter][emphasis]It is an ALTERNATIVE solution...")
}

function saveFlowers() {
    flowerSave = ""
    flowers.forEach((flower) => {
        flowerSave += flower.pos.x + "|" + flower.pos.y + "|" + flower.growth + "|" + flower.color + "|" + flower.cost + "|" + flower.autoed + "|"
    })

    localStorage.flowers = flowerSave
}

function restoreFlowers() {
    if (localStorage.flowers) {
        flowerSave = localStorage.flowers.split("|")
        if (flowerSave.length > 1) {
            for(i=0; i<flowerSave.length/6 - 1; i++) {
                x = new Flower(parseFloat(flowerSave[i*6 + 0]), parseFloat(flowerSave[i*6 + 1]), parseInt(flowerSave[i*6 + 2]), false, parseInt(flowerSave[i*6 + 4]))
                x.autoed = flowerSave[i*6 + 5]
                x.color = flowerSave[i*6 + 3]
                flowers.push(x)
            }
        }
    }
}

function saveWeeds() {
    weedSave = ""
    weeds.forEach((weed) => {
        weedSave += weed.pos.x + "|" + weed.pos.y + "|"
    })

    localStorage.weeds = weedSave
}

function restoreWeeds() {
    if (localStorage.weeds) {
        weedSave = localStorage.weeds.split("|")
        if (weedSave.length > 1) {
            for(i=0; i<weedSave.length/2 - 1; i++) {
                x = new Weed(parseFloat(weedSave[i*2 + 0]), parseFloat(weedSave[i*2 + 1]))
                weeds.push(x)
            }
        }
    }
}

function saveAutos() {
    autoSave = ""
    autos.forEach((auto) => {
        autoSave += auto.pos.x + "|" + auto.pos.y + "|" + auto.range + "|" + auto.cost + "|" + auto.upgradeCount + "|" + auto.freq + "|" + auto.type + "|"
    })

    localStorage.autos = autoSave
}

function restoreAutos() {
    if (localStorage.autos) {
        autoSave = localStorage.autos.split("|")
        if (autoSave.length > 1) {
            for(i=0; i<autoSave.length/7 - 1; i++) {
                if (autoSave[i*7 + 6] == "golem") {
                    x = new Golem(parseFloat(autoSave[i*7 + 0]), parseFloat(autoSave[i*7 + 1]), false, parseInt(autoSave[i*7 + 3]), parseFloat(autoSave[i*7 + 5]), parseFloat(autoSave[i*7 + 2]), parseInt(autoSave[i*7 + 4]))
                } else if (autoSave[i*7 + 6] == "cloud") {
                    x = new Cloud(parseFloat(autoSave[i*7 + 0]), parseFloat(autoSave[i*7 + 1]), false, parseInt(autoSave[i*7 + 3]), parseFloat(autoSave[i*7 + 5]), parseFloat(autoSave[i*7 + 2]), parseInt(autoSave[i*7 + 4]))
                } else if (autoSave[i*7 + 6] == "ghost") {
                    x = new Ghost(parseFloat(autoSave[i*7 + 0]), parseFloat(autoSave[i*7 + 1]), false, parseInt(autoSave[i*7 + 3]), parseFloat(autoSave[i*7 + 5]), parseFloat(autoSave[i*7 + 2]), parseInt(autoSave[i*7 + 4]))
                }

                autos.push(x)
            }
        }
    }
}

let opacity = 0.1
let opacP = 0.025
function open() {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacP < 0 ? opacity : 1})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/5, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2 - canvas.width/5 + canvas.width/11, canvas.width/12, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()

    ctx.font = `${canvas.width/30}px Courier New`
    ctx.fillText("Eyeball Games", canvas.width/2 - 4*canvas.width/30, canvas.height * 0.6)

    opacP *= opacity > 1 ? -1 : 1
    opacity += opacP

    if (opacity <= 0) {
        cutscene = 0
    }
}

function close() {
    dialogue("Rest", "And now I can finally rest.[enter]Flowers for my stone family...[enter]And flowers for me.[enter]Now...[enter][emphasis]I can finally join them in the family cemetery.")
}

let scroll = canvas.height
let blinkOpac = 0
let bC = 0.05
const creditLines = ["Development - @rockwill", "Writing - @rockwill", "Music - @rockwill", "Creating this credits page - @rockwill", "Literally everything - @rockwill", "That one tagalong - @bob", "Thank you for playing..."]
function creditS() {
    ctx.fillStyle = `rgba(0, 0, 0, ${(canvas.height - scroll)/(canvas.height/5)})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = `${canvas.width/15}px ${settings[1]}`
    ctx.fillText("Credits", canvas.width*0.1, canvas.height*0.1 + scroll)
    creditLines.forEach((c, i) => {
        ctx.font = `${canvas.width/45}px ${settings[1]}`
        ctx.fillText(c, canvas.width*0.1, canvas.height*0.1 + canvas.width/22.5*(i + 1) + scroll)
    })
    ctx.fillStyle = "gray"
    roundRect(canvas.width*0.7, (scroll <= canvas.height*0.7 ? canvas.height*0.7 : scroll), canvas.width*0.2, canvas.height*0.5)
    ctx.fillStyle = "white"
    ctx.fillText("RIP Bob.", canvas.width*0.755,(scroll <= canvas.height*0.7 ? canvas.height*0.7 : scroll) + 0.125*canvas.height)
    ctx.fillStyle = `rgba(255, 255, 255, ${blinkOpac})`
    ctx.fillText("[SPACE] to skip.", canvas.width*0.71625,(scroll <= canvas.height*0.7 ? canvas.height*0.7 : scroll) + 0.2*canvas.height)
    scroll -= canvas.height/250
    bC *= blinkOpac >= 1 || blinkOpac < 0 ? -1 : 1
    blinkOpac += bC
}

var cutscene = localStorage.resetReload ? 0 : 2
localStorage.removeItem("resetReload")
const cutscenes = [blank, intro, open, tutorialWeed, tutorialFlower, tutorialWater, tutorialAuto, close, creditS]

var dialogueMenu = false
var altSelected = 0
var particles = []
var settingsMenu = false
const setPre = localStorage.settings
var settings = typeof(setPre) == "undefined" ? [0.2, "Luminari", 1, 5] : [parseFloat(setPre.split(",")[0]), setPre.split(",")[1], parseInt(setPre.split(",")[2]), parseInt(setPre.split(",")[3])]
var running = false
var textHover = 0
var textHoverChange = settings[0] * 2.5
let lastUpdate
let frame = 1
var flowers = []
var flowersPicked = typeof(localStorage.fP) == "undefined" ? 0 : parseInt(localStorage.fP)
var weeds = []
const rows = 5
const margin = 0.2
var points = typeof(localStorage.points) == "undefined" ? 0 : parseInt(localStorage.points)
const boqCount = 12
var boq = Math.floor(points/boqCount)
var widget_showing = false
const widgetMax = canvas.width/4
const widgetMin = canvas.width/20
const widgetFontSize = canvas.width/50
var widgetRadius = widgetMin
var messages = []
var fR = canvas.width/65
var flowerCost = typeof(localStorage.fC) == "undefined" ? 1 : parseInt(localStorage.fC)
const msgLife = 75
const msgSnap = 20
let grasses = []
const grassCount = Math.sqrt(canvas.width*canvas.height)*2
const flowerThresh = 5
var cm = false
var cmSelect = 0
var cmSelected = -1
var autoCosts = localStorage.aC ? [parseInt(localStorage.aC.split(",")[0]), parseInt(localStorage.aC.split(",")[1]), parseInt(localStorage.aC.split(",")[2])] : [10, 10, 10]
const cmRows = [`Planter Golem`, `Cloud Tree`, `Ghost`]
const cmDescriptions = ["Plants flowers[enter]Harvests flowers.", "Waters flowers.", "Picks weeds."]
var autos = []
var editMode = false
function animate() {
    requestAnimationFrame(animate)

    if (running) {
        if (frame == 1) {
            restoreFlowers()
            restoreWeeds()
            restoreAutos()
            if (flowerCost == 1 && points == 0) {
                cutscene = 1
            }
            for(x = 0; x<grassCount; x++) {
                propG = [Math.random()*canvas.width, Math.random()*canvas.height, 0, ([2, 1, 0.5, -0.5, -1, -2][Math.floor(Math.random()*6)])]
                clear = false
                for(i = 0; i<rows; i++) {
                    if (propG[0] > canvas.width/rows * (i + margin) && propG[0] < canvas.width/rows * (i + margin) + canvas.width/rows*(1-2*margin) && propG[1] > margin*canvas.width/rows && propG[1] < margin*canvas.width/rows + canvas.height - margin*canvas.width/rows*2) {
                        clear = true
                        break;
                    }
                }
                if (!clear) {
                    grasses.push(propG.concat([`hsl(115, ${Math.random()*30 + 50}%, 50%)`]))
                }
            }
        }

        saveAutos()
        var now = Date.now();
        var dt = (now - lastUpdate)/30;
        lastUpdate = now;
        ctx.lineWidth = canvas.width/500
        ctx.fillStyle = "rgb(100, 155, 100)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    
        if (cmSelected != -1) {
            // select menu
            clear = false
            for(i = 0; i<rows; i++) {
                if (mousePos.x >= canvas.width/rows * (i + margin) && mousePos.x <= canvas.width/rows * (i + margin) + canvas.width/rows*(1-2*margin) && mousePos.y >= margin*canvas.width/rows && mousePos.y <= margin*canvas.width/rows + canvas.height - margin*canvas.width/rows*2) {
                    clear = true
                    break;
                }
            }
            if (clear) {
                if (autoCosts[cmSelected] <= points) {
                    points -= autoCosts[cmSelected]
                    localStorage.points = points
                    if (cmSelected == 0) {
                        autos.push(new Golem(mousePos.x, mousePos.y))
                    } else if (cmSelected == 1) {
                        autos.push(new Cloud(mousePos.x, mousePos.y))
                    } else if (cmSelected == 2) {
                        autos.push(new Ghost(mousePos.x, mousePos.y))
                    }
                    if (settings[2]) {
                        for (i = 0; i<50; i++) {
                            particles.push(new Particle(mouseX, mouseY, "gray"))
                        }
                    }
                } else {
                    messages.push(new Message("You can't afford that yet.", 0))
                }
            } else {
                messages.push(new Message("Can't place an auto there.", 0))
            }
            cmSelected = -1
        }
    
        if (Math.floor(flowersPicked/boqCount) > boq) {
            messages.push(new Message("You made a new bouquet!", 2))
            boq = Math.floor(flowersPicked/boqCount)
            if (boq >= 3) {
                cutscene = 7
            }
        }
    
        for(i = 0; i<rows; i++) {
            ctx.fillStyle = `rgba(225, 175, 150, 1)`
            ctx.strokeStyle = "black"
            roundRect(canvas.width/rows * (i + margin), margin*canvas.width/rows, canvas.width/rows*(1-2*margin), canvas.height - margin*canvas.width/rows*2)
        }
    
        grasses.forEach((grass) => {
            ctx.strokeStyle = grass[4]
            ctx.beginPath()
            ctx.moveTo(grass[0], grass[1])
            ctx.lineTo(grass[0] + grass[2], grass[1] - canvas.height/40)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
            grass[2] += 0.1*grass[3]
            grass[3] *= Math.abs(grass[2]) > canvas.width/500 ? -1 : 1
        })
    
        ctx.strokeStyle = "black"
    
        weeds.forEach((weed) => {
            flowerRadius = fR
            ctx.fillStyle = "rgb(150, 225, 150)"
            ctx.beginPath()
            ctx.arc(weed.pos.x + flowerRadius/2, weed.pos.y, flowerRadius/2, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(weed.pos.x - flowerRadius/2, weed.pos.y, flowerRadius/2, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(weed.pos.x, weed.pos.y - flowerRadius/2, flowerRadius/2, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(weed.pos.x, weed.pos.y + flowerRadius/2, flowerRadius/2, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(weed.pos.x, weed.pos.y, flowerRadius/2, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
        })
    
        flowers.forEach((flower, index) => {
            clear = false
            for(i = 0; i<rows; i++) {
                if (flower.pos.x >= canvas.width/rows * (i + margin) && flower.pos.x <= canvas.width/rows * (i + margin) + canvas.width/rows*(1-2*margin) && flower.pos.y >= margin*canvas.width/rows && flower.pos.y <= margin*canvas.width/rows + canvas.height - margin*canvas.width/rows*2) {
                    clear = true
                    break;
                }
            }
            if (clear) {
                if (flower.justCreated) {
                    if (settings[2]) {
                        for (i = 0; i<50; i++) {
                            particles.push(new Particle(flower.pos.x, flower.pos.y, "pink"))
                        }
                    }
                    if (flowersPicked == 0 && flowerCost == 3) {
                        messages.push(new Message("You planted your first flower!", 1))
                        cutscene = 5
                    }
                    flower.justCreated = false
                    pushFx("flowerPlace.wav")
                }
                flowerRadius = flower.growth*fR/10 * 6
                ctx.fillStyle = "white"
                ctx.beginPath()
                ctx.arc(flower.pos.x + flowerRadius/2, flower.pos.y, flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(flower.pos.x - flowerRadius/2, flower.pos.y, flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(flower.pos.x, flower.pos.y - flowerRadius/2, flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(flower.pos.x, flower.pos.y + flowerRadius/2, flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(flower.pos.x, flower.pos.y, flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fillStyle = "white"
                ctx.fill()
                ctx.stroke()
                ctx.fillStyle = flower.color
                ctx.beginPath()
                ctx.arc(flower.pos.x, flower.pos.y, flower.growth/(flowerThresh + 0.5)*flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.beginPath()
                ctx.arc(flower.pos.x, flower.pos.y, flowerRadius/2, 0, 2*Math.PI)
                ctx.closePath()
                ctx.stroke()
            } else {
                if (!flower.autoed) {
                    messages.push(new Message(["Can't plant there.", "That's not dirt.", "Invalid plantery."][Math.floor(Math.random()*3)], 0))
                }
                flowers.splice(index, 1)
                points += flower.cost
                localStorage.points = points
                flowerCost = flower.cost
                localStorage.fC = flowerCost
                saveFlowers()
            }
        })
    
        autos.forEach((auto, index) => {
            auto.draw()
        })

        if (settings[2]) {
            particles.forEach((particle, index) => {
                particle.draw()
                if (particle.radius < 0.1) {
                    particles.splice(index, 1)
                }
            })
        }
    
        messages.forEach((message, index) => {
            ctx.fillStyle = "rgba(" + ["225, 150, 150", "150, 225, 150", "225, 225, 150", "150, 150, 225"][message.type] + ",0.85)"
            ctx.beginPath()
            ctx.fillRect(canvas.width*0.75 + canvas.width*0.4, (index + 1)*canvas.width/25 - canvas.width/50, -((frame - message.time)/(frame - message.time > (msgSnap) ? frame - message.time : msgSnap)) * canvas.width*0.4, canvas.width/37.5)
            ctx.strokeRect(canvas.width*0.75 + canvas.width*0.4, (index + 1)*canvas.width/25 - canvas.width/50, -((frame - message.time)/(frame - message.time > (msgSnap) ? frame - message.time : msgSnap)) * canvas.width*0.4, canvas.width/37.5)
            ctx.closePath()
        })
    
        messages.forEach((message, index) => {
            ctx.font = `${canvas.width/75}px ${settings[1]}`
            ctx.fillStyle = "black"
            ctx.fillText(message.text, canvas.width*0.75 + canvas.width*0.4-((frame - message.time)/(frame - message.time > (msgSnap) ? frame - message.time : msgSnap)) * canvas.width*0.4 + canvas.width/75, (index + 1)*canvas.width/25)
            if (frame - message.time >= msgLife) {
                messages.splice(index, 1)
            }
        })
    
    
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.beginPath()
        ctx.arc(0, 0, widgetRadius, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        if (widget_showing) {
            widgetRadius += widgetRadius < widgetMax ? widgetMin : (-widgetRadius + widgetMax)
            ctx.fillStyle = "white"
            ctx.font = `${widgetFontSize*(widgetRadius - widgetMin)/(widgetMax - widgetMin)}px ${settings[1]}`
            ctx.fillText(`Points: ${points}`, widgetFontSize, widgetFontSize*2)
            ctx.fillText(`Flowers Picked: ${flowersPicked}/${boqCount*(boq+1)}`, widgetFontSize, widgetFontSize*3)
            ctx.fillText(`Bouquets: ${boq}/3`, widgetFontSize, widgetFontSize*4)
            ctx.fillText(`Flower Cost: ${flowerCost}`, widgetFontSize, widgetFontSize*5)
            ctx.fillText(`[Menu: Alt + Q]`, widgetFontSize, widgetFontSize*7)
        } else {
            widgetRadius -= widgetRadius > widgetMin ? widgetMin : (widgetRadius - widgetMin)
        }
    
        if (Math.random() >= 0.9 + 0.01*weeds.length) {
            i = Math.floor(Math.random() * rows)
            rand = Math.random()
            weeds.push(new Weed(canvas.width/rows * (i + margin) + Math.random()*canvas.width/rows*(1-2*margin), margin*canvas.width/rows + Math.random()*(canvas.height - margin*canvas.width/rows*2)))
            saveWeeds()
        }
    
        if (cm) {
            r = canvas.width/100
            xO = Math.cos(Math.PI/4)*r
            yO = Math.sin(Math.PI/4)*r
            for(i=0; i<cmRows.length; i++) {
                ctx.fillStyle = i == cmSelect ? "rgb(100, 100, 255)" : "white"
                ctx.fillRect(mouseX + xO, mouseY + canvas.height/20*i + yO, canvas.width/6, canvas.height/20)
                ctx.strokeRect(mouseX + xO, mouseY + canvas.height/20*i + yO, canvas.width/6, canvas.height/20)
                ctx.font = `${canvas.width/75}px ${settings[1]}`
                ctx.fillStyle = cmSelect == i ? "white" : "black"
                ctx.fillText(cmRows[i] + ` - $${autoCosts[i]}`, mouseX + xO + canvas.width/75, mouseY + canvas.height/20*i + yO + canvas.height/37.5)
            }
            ctx.fillStyle = "white"
            ctx.fillRect(mouseX + canvas.width/6 + xO, mouseY + yO, canvas.width/6, canvas.height/20 * cmRows.length)
            ctx.strokeRect(mouseX + canvas.width/6 + xO, mouseY + yO, canvas.width/6, canvas.height/20 * cmRows.length)
            ctx.fillStyle = "black"
            cmDescriptions[cmSelect].split("[enter]").forEach((line, index) => {
                ctx.fillText(line, mouseX + canvas.width/6 + xO + canvas.width/75, mouseY + canvas.width/105 + canvas.width/60*(index+1) + yO)
            })
        }
    
        frame += 1
    } else if (dialogueMenu) {
        menuHovering = -1
        for (i=0; i<dialogues.length; i++) {
            if (mousePos.y >= canvas.height/2 + canvas.width/25*(i) - textHover && mousePos.y <= canvas.height/2 + canvas.width/25*(i+1)) {
                menuHovering = i
                break;
            }
        }

        ctx.fillStyle = "rgb(50, 150, 50)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (menuHovering != -1) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
            ctx.fillRect(0, canvas.height/2 + canvas.width/25*(menuHovering) - textHover + canvas.height/60, canvas.width, canvas.width/25)
        }

        ctx.fillStyle = "white"
        ctx.font = `${canvas.width/20}px ${settings[1]}`
        ctx.fillText("The Dialogues.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px ${settings[1]}`
        ctx.fillText("Back.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillStyle = "black"
        ctx.fillText(dialogues.length == 0 ? "No dialogues yet..." : "", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25*(2) - textHover)
        dialogues.forEach((dialogue, index) => {
            ctx.fillText(dialogue[0], canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25*(index + 2) - textHover)
        })

        if (showingDialogue != -1 && typeof(dialogues[showingDialogue]) != "undefined") {
            dialogue(dialogues[showingDialogue][0], dialogues[showingDialogue][1], false)
        }

        for (i=0; i<canvas.width/5; i++) {
            ctx.strokeStyle = "green"
            ctx.beginPath()
            ctx.moveTo(i*5, canvas.height)
            ctx.lineTo(i*5 + textHover*0.3*-1, canvas.height*0.98)
            ctx.closePath()
            ctx.stroke()
        }

        for (i=0.5; i<canvas.width/37; i++) {
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.moveTo(i*37, canvas.height)
            ctx.lineTo(i*37 + textHover*0.3*-1, canvas.height*0.92)
            ctx.closePath()
            ctx.stroke()

            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 - canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 + canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.90, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.94, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = `hsl(${255*i/37}, 50%, 50%)`
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    } else if (clearMenu) {
        for (i=0; i<2; i++) {
            if (mousePos.y >= canvas.height/2 + canvas.width/25*(i) - textHover && mousePos.y <= canvas.height/2 + canvas.width/25*(i+1)) {
                menuHovering = i
                break;
            }
        }

        ctx.fillStyle = "rgb(50, 150, 50)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (i != 2) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
            ctx.fillRect(0, canvas.height/2 + canvas.width/25*(menuHovering) - textHover + canvas.height/60, canvas.width, canvas.width/25)
        }

        ctx.fillStyle = "white"
        ctx.font = `${canvas.width/20}px ${settings[1]}`
        ctx.fillText("The Confirmation.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px ${settings[1]}`
        ctx.fillText("Yes.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillText("No.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 2 - textHover)

        for (i=0; i<canvas.width/5; i++) {
            ctx.strokeStyle = "green"
            ctx.beginPath()
            ctx.moveTo(i*5, canvas.height)
            ctx.lineTo(i*5 + textHover*0.3*-1, canvas.height*0.98)
            ctx.closePath()
            ctx.stroke()
        }

        for (i=0.5; i<canvas.width/37; i++) {
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.moveTo(i*37, canvas.height)
            ctx.lineTo(i*37 + textHover*0.3*-1, canvas.height*0.92)
            ctx.closePath()
            ctx.stroke()

            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 - canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 + canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.90, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.94, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = `hsl(${255*i/37}, 50%, 50%)`
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    } else if (settingsMenu) {
        for (i=0; i<5; i++) {
            if (mousePos.y >= canvas.height/2 + canvas.width/25*(i) - textHover && mousePos.y <= canvas.height/2 + canvas.width/25*(i+1)) {
                menuHovering = i
                break;
            } else {
                menuHovering = -1
            }
        }

        ctx.fillStyle = "rgb(50, 150, 50)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"

        if (menuHovering != -1) {
            ctx.fillRect(0, canvas.height/2 + canvas.width/25*(menuHovering) - textHover + canvas.height/60, canvas.width, canvas.width/25)
        }

        ctx.fillStyle = "white"
        ctx.font = `${canvas.width/20}px ${settings[1]}`
        ctx.fillText("The Settings.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px ${settings[1]}`
        ctx.fillText(`Font: ${settings[1]}.`, canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillText(`Screen Effects: ${settings[0] == 0.2 ? "On" : "Off"}`, canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25*2 - textHover)
        ctx.fillText(`Particles: ${settings[2] == 1 ? "On" : "Off"}`, canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25*3 - textHover)
        ctx.fillText(`SFX Volume: ${settings[3]*10}%`, canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25*4 - textHover)
        ctx.fillText("[Back to menu]", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 5 - textHover)

        for (i=0; i<canvas.width/5; i++) {
            ctx.strokeStyle = "green"
            ctx.beginPath()
            ctx.moveTo(i*5, canvas.height)
            ctx.lineTo(i*5 + textHover*0.3*-1, canvas.height*0.98)
            ctx.closePath()
            ctx.stroke()
        }

        for (i=0.5; i<canvas.width/37; i++) {
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.moveTo(i*37, canvas.height)
            ctx.lineTo(i*37 + textHover*0.3*-1, canvas.height*0.92)
            ctx.closePath()
            ctx.stroke()

            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 - canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 + canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.90, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.94, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = `hsl(${255*i/37}, 50%, 50%)`
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    } else if (credits) {
        for (i=1; i<2; i++) {
            if (mousePos.y >= canvas.height/2 + canvas.width/25*(i) - textHover && mousePos.y <= canvas.height/2 + canvas.width/25*(i+1)) {
                menuHovering = i
                break;
            }
        }

        ctx.fillStyle = "rgb(50, 150, 50)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (i != 2) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
            ctx.fillRect(0, canvas.height/2 + canvas.width/25*(menuHovering) - textHover + canvas.height/60, canvas.width, canvas.width/25)
        }

        ctx.fillStyle = "white"
        ctx.font = `${canvas.width/20}px ${settings[1]}`
        ctx.fillText("The Credits.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px ${settings[1]}`
        ctx.fillText("Created by @rockwill.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillText("[Back to menu]", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 2 - textHover)

        for (i=0; i<canvas.width/5; i++) {
            ctx.strokeStyle = "green"
            ctx.beginPath()
            ctx.moveTo(i*5, canvas.height)
            ctx.lineTo(i*5 + textHover*0.3*-1, canvas.height*0.98)
            ctx.closePath()
            ctx.stroke()
        }

        for (i=0.5; i<canvas.width/37; i++) {
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.moveTo(i*37, canvas.height)
            ctx.lineTo(i*37 + textHover*0.3*-1, canvas.height*0.92)
            ctx.closePath()
            ctx.stroke()

            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 - canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 + canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.90, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.94, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = `hsl(${255*i/37}, 50%, 50%)`
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    } else {
        for (i=0; i<5; i++) {
            if (mousePos.y >= canvas.height/2 + canvas.width/25*(i) - textHover && mousePos.y <= canvas.height/2 + canvas.width/25*(i+1)) {
                menuHovering = i
                break;
            }

            if (i==2) {
                menuHovering = -1
            }
        }

        ctx.fillStyle = "rgb(50, 150, 50)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        if (menuHovering != -1) {
            ctx.fillRect(0, canvas.height/2 + canvas.width/25*(menuHovering) - textHover + canvas.height/60, canvas.width, canvas.width/25)
        }

        ctx.fillStyle = "white"
        ctx.font = `${canvas.width/20}px ${settings[1]}`
        ctx.fillText("A Quiet Flowerbed.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px ${settings[1]}`
        ctx.fillText("Settings.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillText(flowerCost == 1 && points == 0 ? "New Game." : "Resume Game.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 2 - textHover)
        ctx.fillText("Credits.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 3 - textHover)
        ctx.fillText("Discovered Dialogues.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 4 - textHover)
        ctx.fillText("Clear Save Data.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 5 - textHover)

        for (i=0; i<canvas.width/5; i++) {
            ctx.strokeStyle = "green"
            ctx.beginPath()
            ctx.moveTo(i*5, canvas.height)
            ctx.lineTo(i*5 + textHover*0.3*-1, canvas.height*0.98)
            ctx.closePath()
            ctx.stroke()
        }

        for (i=0.5; i<canvas.width/37; i++) {
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.moveTo(i*37, canvas.height)
            ctx.lineTo(i*37 + textHover*0.3*-1, canvas.height*0.92)
            ctx.closePath()
            ctx.stroke()

            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 - canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1 + canvas.height/50, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.90, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.94, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = `hsl(${255*i/37}, 50%, 50%)`
            ctx.beginPath()
            ctx.arc(i*37 + textHover*0.3*-1, canvas.height*0.92, canvas.width/100, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    }
    
    cutscenes[cutscene]()

    for (i=0; i<=canvas.height/3; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${settings[0]})`
        ctx.lineWidth = canvas.width/500
        ctx.beginPath()
        ctx.moveTo(0, i*3)
        ctx.lineTo(canvas.width, i*3)
        ctx.closePath()
        ctx.stroke()
    }

    textHoverChange *= Math.abs(textHover) > 10 ? -1 : 1
    textHover += textHoverChange

    editMode = alt && running
    if (editMode) {
        ctx.fillStyle = "rgba(0, 0, 255, 0.2)"
        ctx.beginPath()
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.closePath()

        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.fillRect(canvas.width*0.8, 0, canvas.width*0.2, canvas.height/3)
        ctx.strokeRect(canvas.width*0.8, 0, canvas.width*0.2, canvas.height/3)
        ctx.closePath()
        ctx.beginPath()
        ctx.fillRect(canvas.width*0.8, canvas.height/3, canvas.width*0.2, canvas.height/3)
        ctx.strokeRect(canvas.width*0.8, canvas.height/3, canvas.width*0.2, canvas.height/3)
        ctx.closePath()
        ctx.beginPath()
        ctx.fillRect(canvas.width*0.8, canvas.height/3 * 2, canvas.width*0.2, canvas.height/3)
        ctx.strokeRect(canvas.width*0.8, canvas.height/3 * 2, canvas.width*0.2, canvas.height/3)
        ctx.closePath()
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.beginPath()
        ctx.fillRect(canvas.width*0.8, canvas.height*(1/3*altSelected), canvas.width*0.2, canvas.height/3)
        ctx.strokeRect(canvas.width*0.8, canvas.height*(1/3*altSelected), canvas.width*0.2, canvas.height/3)
        ctx.closePath()
        ctx.fillStyle = "rgb(250, 150, 150)"
        ctx.font = `${canvas.width/60}px ${settings[1]}`
        ctx.fillText("     Delete", canvas.width*0.85, canvas.height*0.165)
        ctx.fillStyle = "white"
        upCost = 0
        autos.forEach((auto) => {
            upCost += auto.range
        })
        upCost = Math.round(upCost * 2) == 0 ? 59 : Math.round(upCost * 2)
        ctx.fillText(`Range + ($${upCost})`, canvas.width*0.85, canvas.height*0.498)
        upCost = 0
        autos.forEach((auto) => {
            upCost += 100/auto.freq
        })
        upCost = Math.round(upCost * 100) == 0 ? 50 : Math.round(upCost * 100)
        ctx.fillText(`Rate + ($${upCost})`, canvas.width*0.85, canvas.height*0.832)
    }

    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, canvas.width/100, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
    ctx.fill()
    ctx.stroke()
}

animate()
