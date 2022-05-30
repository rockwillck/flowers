var canvas = document.getElementById(`canvas`);
var ctx = canvas.getContext('2d');
var rect = canvas.getBoundingClientRect();
canvas.width = window.innerWidth - rect.left*2
canvas.height = window.innerHeight - rect.top*2

class Flower {
    constructor(x, y, growth) {
        this.pos = {
            x: x,
            y: y
        }
        this.growth = growth
        this.color = `hsl(${Math.random()*255}, 50%, 50%)`
        this.cost = flowerCost
        flowerCost = Math.round(flowerCost*2.5)
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
    constructor(x, y) {
        this.pos = {x:x, y:y}
        this.freq = 100
        this.speed = 3
        this.range = canvas.width/35
        this.last = frame
        this.cost = autoCosts[0]
        autoCosts[0] = Math.round(autoCosts[0]*1.25)
        this.direction = 1
    }

    draw() {
        if (this.pos.y <= margin*canvas.width/rows || this.pos.y >= canvas.height - margin*canvas.width/rows) {
            this.direction *= -1
        }
        this.pos.y -= this.direction*this.speed
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
        if (frame - this.last >= this.freq) {
            if (points >= flowerCost) {
                clear = true
                flowers.forEach((flower) => {
                    if ((flower.pos.x - this.pos.x)**2 + (flower.pos.y - this.pos.y)**2 <= (flower.growth + fR + this.range)**2) {
                        clear = false
                    }
                })

                if (clear) {
                    flowers.push(new Flower(this.pos.x, this.pos.y, 1))
                    this.last = frame
                }
            }
        }
    }
}

class Ghost {
    constructor(x, y) {
        this.pos = {x:x, y:y}
        this.freq = 100
        this.speed = 3
        this.range = canvas.width/35
        this.last = frame
        this.cost = autoCosts[2]
        autoCosts[2] = Math.round(autoCosts[2]*1.25)
        this.direction = 1
    }

    draw() {
        if (this.pos.y <= margin*canvas.width/rows || this.pos.y >= canvas.height - margin*canvas.width/rows) {
            this.direction *= -1
        }
        this.pos.y -= this.direction*this.speed
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
        if (frame - this.last >= this.freq) {
            clear = false
            weeds.forEach((weed, index) => {
                if ((weed.pos.x - this.pos.x)**2 + (weed.pos.y - this.pos.y)**2 <= (fR + this.range)**2 && !clear) {
                    clear = true
                    weeds.splice(index, 1)
                }
            })

            if (clear) {
                this.last = frame
                points += 1
            }
        }
    }
}

class Cloud {
    constructor(x, y) {
        this.pos = {x:x, y:y}
        this.freq = 100
        this.range = canvas.width/35
        this.last = frame
        this.cost = autoCosts[1]
        autoCosts[1] = Math.round(autoCosts[1]*1.25)
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

        if (frame - this.last >= this.freq) {
            clear = false
            flowers.forEach((flower, index) => {
                if ((flower.pos.x - this.pos.x)**2 + (flower.pos.y - this.pos.y)**2 <= (fR + flower.growth + this.range)**2 && !clear && flower.growth < flowerThresh) {
                    clear = true
                    flower.growth += 1
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
window.addEventListener("keydown", function(event) {
    if (cm) {
        if (event.key == "ArrowUp" || event.key == "w") {
            cmSelect = cmSelect > 0 ? cmSelect - 1 : cmRows.length - 1
        } else if (event.key == "ArrowDown" || event.key == "s") {
            cmSelect = (cmSelect + 1) % cmRows.length
        } else if (event.key == "Enter") {
            cm = false
            cmSelected = cmSelect
        }
    }
    if (event.key == "Alt") {
        alt = true
    }

    if (event.code == "KeyQ" && alt) {
        running = false
    }
})

window.addEventListener("keyup", function(event) {
    if (event.key == "Alt") {
        alt = false
    }
})

var menuHovering = -1
window.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top
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
window.addEventListener("click", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    if (running) {
        altClicked = false
        if (alt) {
            autos.forEach((auto, index) => {
                if ((auto.pos.x - mouseX)**2 + (auto.pos.y - mouseY) ** 2 <= (auto.range)**2) {
                    points += auto.cost*0.8
                    autos.splice(index, 1)
                    clear = false
                    messages.push(new Message(`+ $${auto.cost*0.8}`, 1))
                }
            })
        }
    
        clear = true
        weedClicked = false
        flowerPicked = false
        for(i=0;i<weeds.length;i++) {
            flowerRadius = fR
            index = weeds.length - i - 1
            weed = weeds[index]
            if ((weed.pos.x - mouseX)**2 + (weed.pos.y - mouseY)**2 <= flowerRadius**2*2) {
                weeds.splice(index, 1)
                points += 1
                clear = false
                weedClicked = true
                break;
            }
        }
        flowers.forEach((flower, index) => {
            flowerRadius = flower.growth + fR
            if ((flower.pos.x - mouseX)**2 + (flower.pos.y - mouseY)**2 <= flowerRadius**2*2) {
                if (flower.growth >= flowerThresh) {
                    flowers.splice(index, 1)
                    flowersPicked += 1
                    if (flowersPicked == 1) {
                        messages.push(new Message("You picked your first flower!", 1))
                    }
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
                flowers.push(new Flower(mouseX, mouseY, 1))
            } else {
                if (!cm) {
                    messages.push(new Message(["You don't have enough points.", "Ya broke you poor peasant.", "Begging for flowers? Ha!"][Math.floor(Math.random()*3)], 0))
                }
                cm = false
            }
        } else {
            if (!flowerPicked) {
                if (weedClicked) {
                    if (points == 1 && flowers.length == 0) {
                        messages.push(new Message("You picked your first weed!", 1))
                    }
                } else if (!altClicked) {
                    messages.push(new Message((["There's already a flower there.", "Uh... can't overlap flowers...", "Stay calm and don't overlap the freaking flowers idiot!"])[Math.floor(Math.random()*3)], 0))
                }
            }
        }
    } else {
        if (menuHovering == 1 && !credits) {
            running = true
        } else if (menuHovering == 1) {
            credits = false
        } else if (menuHovering == 2) {
            credits = true
        }
    }
});

window.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top
    
    clear = false
    flowers.forEach((flower) => {
        flowerRadius = flower.growth + fR
        if ((flower.pos.x - mouseX)**2 + (flower.pos.y - mouseY)**2 <= flowerRadius**2*2) {
            clear = true
            if (flower.growth < flowerThresh) {
                flower.growth += 1
                if (flowers.length == 1 && flowers[0].growth == 2) {
                    messages.push(new Message("You watered your first flower!", 3))
                }
            }
        }
    })

    if (!clear) {
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

var running = false
var textHover = 0
var textHoverChange = 1
let lastUpdate
let frame = 1
var flowers = []
var flowersPicked = 0
var weeds = []
const rows = 5
const margin = 0.2
var points = 0
var boq = 0
const boqCount = 2
var widget_showing = false
const widgetMax = canvas.width/4
const widgetMin = canvas.width/20
const widgetFontSize = canvas.width/50
var widgetRadius = widgetMin
var messages = []
var fR = 15
var flowerCost = 1
const msgLife = 75
const msgSnap = 20
let grasses = []
const grassCount = Math.sqrt(canvas.width*canvas.height)*2
const flowerThresh = 5
var cm = false
var cmSelect = 0
var cmSelected = -1
var autoCosts = [10, 10, 10]
const cmRows = [`Planter Golem`, `Cloud Tree`, `Ghost`]
var autos = []
function animate() {
    requestAnimationFrame(animate)
    if (running) {
        if (frame == 1) {
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
        var now = Date.now();
        var dt = (now - lastUpdate)/30;
        lastUpdate = now;
        ctx.lineWidth = 2.5
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
                    if (cmSelected == 0) {
                        autos.push(new Golem(mousePos.x, mousePos.y))
                    } else if (cmSelected == 1) {
                        autos.push(new Cloud(mousePos.x, mousePos.y))
                    } else if (cmSelected == 2) {
                        autos.push(new Ghost(mousePos.x, mousePos.y))
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
    
        flowers.forEach((flower, index) => {
            clear = false
            for(i = 0; i<rows; i++) {
                if (flower.pos.x >= canvas.width/rows * (i + margin) && flower.pos.x <= canvas.width/rows * (i + margin) + canvas.width/rows*(1-2*margin) && flower.pos.y >= margin*canvas.width/rows && flower.pos.y <= margin*canvas.width/rows + canvas.height - margin*canvas.width/rows*2) {
                    clear = true
                    break;
                }
            }
            if (clear) {
                flowerRadius = flower.growth + fR
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
                flowers.splice(index, 1)
                messages.push(new Message(["Can't plant there.", "That's not dirt.", "Invalid plantery."][Math.floor(Math.random()*3)], 0))
                points += flower.cost
                flowerCost = flower.cost
            }
        })
    
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
    
        autos.forEach((auto, index) => {
            auto.draw()
        })
    
        messages.forEach((message, index) => {
            ctx.fillStyle = "rgba(" + ["225, 150, 150", "150, 225, 150", "225, 225, 150", "150, 150, 225"][message.type] + ",0.85)"
            ctx.beginPath()
            ctx.fillRect(canvas.width*0.75 + canvas.width*0.4, (index + 1)*canvas.width/25 - canvas.width/50, -((frame - message.time)/(frame - message.time > (msgSnap) ? frame - message.time : msgSnap)) * canvas.width*0.4, canvas.width/37.5)
            ctx.strokeRect(canvas.width*0.75 + canvas.width*0.4, (index + 1)*canvas.width/25 - canvas.width/50, -((frame - message.time)/(frame - message.time > (msgSnap) ? frame - message.time : msgSnap)) * canvas.width*0.4, canvas.width/37.5)
            ctx.closePath()
        })
    
        messages.forEach((message, index) => {
            ctx.font = `${canvas.width/75}px Luminari`
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
            ctx.font = `${widgetFontSize*(widgetRadius - widgetMin)/(widgetMax - widgetMin)}px Luminari`
            ctx.fillText(`Points: ${points}`, widgetFontSize, widgetFontSize*2)
            ctx.fillText(`Flowers Picked: ${flowersPicked}/${boqCount*(boq+1)}`, widgetFontSize, widgetFontSize*3)
            ctx.fillText(`Bouquets: ${boq}`, widgetFontSize, widgetFontSize*4)
            ctx.fillText(`Flower Cost: ${flowerCost}`, widgetFontSize, widgetFontSize*5)
            ctx.fillText(`[Menu: Alt + Q]`, widgetFontSize, widgetFontSize*7)
        } else {
            widgetRadius -= widgetRadius > widgetMin ? widgetMin : (widgetRadius - widgetMin)
        }
    
        if (Math.random() >= 0.9 + 0.01*weeds.length) {
            i = Math.floor(Math.random() * rows)
            rand = Math.random()
            weeds.push(new Weed(canvas.width/rows * (i + margin) + Math.random()*canvas.width/rows*(1-2*margin), margin*canvas.width/rows + Math.random()*(canvas.height - margin*canvas.width/rows*2)))
        }
    
        if (cm) {
            r = canvas.width/100
            xO = Math.cos(Math.PI/4)*r
            yO = Math.sin(Math.PI/4)*r
            for(i=0; i<cmRows.length; i++) {
                ctx.fillStyle = i == cmSelect ? "rgb(100, 100, 255)" : "white"
                ctx.fillRect(mouseX + xO, mouseY + canvas.height/20*i + yO, canvas.width/6, canvas.height/20)
                ctx.strokeRect(mouseX + xO, mouseY + canvas.height/20*i + yO, canvas.width/6, canvas.height/20)
                ctx.font = `${canvas.width/75}px Luminari`
                ctx.fillStyle = cmSelect == i ? "white" : "black"
                ctx.fillText(cmRows[i] + ` - $${autoCosts[i]}`, mouseX + xO + canvas.width/75, mouseY + canvas.height/20*i + yO + canvas.height/37.5)
            }
        }
    
        frame += 1
    } else if (credits) {
        for (i=0; i<3; i++) {
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
        if (menuHovering == 1) {
            ctx.fillRect(0, canvas.height/2 + canvas.width/25*(menuHovering) - textHover + canvas.height/60, canvas.width, canvas.width/25)
        }

        ctx.fillStyle = "white"
        ctx.font = `${canvas.width/20}px Luminari`
        ctx.fillText("The Credits.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px Luminari`
        ctx.fillText("Programming/Game Assets - @rockwill", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillText("[Back to menu]", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 2 - textHover)

        textHoverChange *= Math.abs(textHover) > 10 ? -1 : 1
        textHover += textHoverChange

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
        for (i=0; i<3; i++) {
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
        ctx.font = `${canvas.width/20}px Luminari`
        ctx.fillText("A Bed of Flowers.", canvas.width/2 - (canvas.width/20*5), canvas.height/2 - canvas.width/20 - textHover)
        ctx.font = `${canvas.width/50}px Luminari`
        ctx.fillText("Tutorial.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 - textHover)
        ctx.fillText("Start.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 2 - textHover)
        ctx.fillText("Credits.", canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/25 * 3 - textHover)

        textHoverChange *= Math.abs(textHover) > 10 ? -1 : 1
        textHover += textHoverChange

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
    
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, canvas.width/100, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
    ctx.fill()
    ctx.stroke()
}

animate()
