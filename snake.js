const followRate = 60;
        class SnakeSegment{
            snakePos = {x:0, y:0};
            goalPos = this.snakePos;
            direction = {up:0, right:1};//should be 1,0, or -1
            previousPos = this.snakePos;
            previousDirection = this.direction;
            segmentToFollow;

            constructor(segmentToFollow) {
                if(segmentToFollow!=null||this.segmentToFollow!=undefined) {
                    this.segmentToFollow = segmentToFollow;
                    this.setGoalPos();
                    this.resetSegmentPos();
                    setInterval(()=>{this.setGoalPos()}, followRate);
                }
            }

            applyVelocity() {
                this.snakePos.x += velocity*this.direction.right;
                this.snakePos.y += velocity*this.direction.up;
            }
            

            resetSegmentPos() {
                this.snakePos = {x: this.segmentToFollow.snakePos.x-segmentSize*2, y: this.segmentToFollow.snakePos.y-segmentSize*2}
            }

            interpolate() {
                if(!(this.segmentToFollow==null||this.segmentToFollow==undefined)) {
                    let isXFurtherFromGoalThanY = Math.abs(this.goalPos.x-this.snakePos.x) > Math.abs(this.goalPos.y-this.snakePos.y);
                    let differenceBetweenXAndY = Math.abs(this.goalPos.x-this.snakePos.x) - Math.abs(this.goalPos.y-this.snakePos.y);
                    if(isXFurtherFromGoalThanY) {
                        if(this.goalPos.x>this.snakePos.x) {
                            this.snakePos.x += velocity*1.5;
                        } else {
                            this.snakePos.x -= velocity*1.5;
                        }
                    } else{

                        if(this.goalPos.y>this.snakePos.y) {
                            this.snakePos.y += velocity*1.5;
                        } else {
                            this.snakePos.y -= velocity*1.5;
                        }
                    }

                    if(differenceBetweenXAndY<1) {
                        if(isXFurtherFromGoalThanY) {
                            //this.snakePos.y = this.goalPos.y;
                        } else{
                            //this.snakePos.x = this.goalPos.x;
                        }
                        
                    }

                }
            }

            getNewDirection() {
                if(!(this.segmentToFollow==null||this.segmentToFollow==undefined)) {
                    this.direction = this.previousDirection;
                    //this.snakePos = this.previousPos;
                    this.previousDirection = this.segmentToFollow.direction;
                    this.previousPos = this.segmentToFollow.snakePos;
                }
            }

            setGoalPos() {
                for(let i = 1; i < segments.length; i++) {
                    applyMusicVariation(i);
                }
                if(!(this.segmentToFollow==null||this.segmentToFollow==undefined)) {
                    this.getNewDirection();
                    this.goalPos = {x: this.segmentToFollow.snakePos.x-(segmentSize*this.direction.right)/2, y: this.segmentToFollow.snakePos.y-(segmentSize*this.direction.up)/2};
                }
                oscillateDirection = oscillateDirection==-1? 1 : -1;
                
            }

        }
        const wallBufferSize = 10;
        let canvas = document.getElementById("gameZone");
        let ctx = canvas.getContext("2d");
        let foodPos = {x:0, y:0};
        let points = 0;
        let segmentSize = 10;
        let updateRate = 60;
        let velocity = 0.5;
        let segments = [new SnakeSegment()];
        getNewFoodPos();
        ctx.fillStyle = "#FF0000";
        ctx.strokeStyle = "#800000";
        ctx.lineWidth = segmentSize/2;
        let updateInterval;
        document.getElementById("start").addEventListener('click', ()=> {
            let sound = document.getElementById("upload").files[0];
            document.querySelector("audio").src = URL.createObjectURL(sound);
            initializeAudioAnylizer();
            updateInterval = setInterval(update, updateRate/1000);
        });
        
        let update = ()=> {
            document.getElementById("points").innerHTML = points;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            segments[0].applyVelocity();
            for(let i = 1; i < segments.length; i++) {
                let segment = segments[i];
                if(getDistanceToSegment(segment)<segmentSize-(segmentSize/2)) {
                    //die();
                }
                if(segments[0].snakePos.x>canvas.width+wallBufferSize||segments[0].snakePos.x<0-wallBufferSize||segments[0].snakePos.y>canvas.height+wallBufferSize||segments[0].snakePos.y<0-wallBufferSize) {
                    die();
                }
                segment.interpolate();
                ctx.beginPath();
                ctx.moveTo(segments[i-1].snakePos.x, segments[i-1].snakePos.y);
                ctx.lineTo(segment.snakePos.x, segment.snakePos.y);
                ctx.stroke();
                ctx.fillRect(segment.snakePos.x, segment.snakePos.y, segmentSize, segmentSize);
            }
            ctx.fillRect(segments[0].snakePos.x, segments[0].snakePos.y, segmentSize, segmentSize);
            ctx.fillRect(foodPos.x, foodPos.y,segmentSize, segmentSize);
            if(getDistanceToFood()<segmentSize) {
                eat();
            }
            
        }
        
        
        let segmentIter = 1;

        document.addEventListener('keydown', function(addEventListener) {
            switch(event.keyCode) {
                case 37://left
                    segments[0].direction.up = 0;
                    segments[0].direction.right = -1;
                    break;
                case 38://up
                    segments[0].direction.up = -1;
                    segments[0].direction.right = 0;
                    break;
                case 39://right
                    segments[0].direction.up = 0;
                    segments[0].direction.right = 1;
                    break;
                case 40://down
                    segments[0].direction.up = 1;
                    segments[0].direction.right = 0;
                    break;
            }
        });

        function eat() {
            foodPos.x = Math.floor(Math.random() * Math.floor(canvas.width));
            foodPos.y = Math.floor(Math.random() * Math.floor(canvas.height));
            segments.push(new SnakeSegment(segments[segments.length-1]));
            points++;
        }

        function getNewFoodPos() {
            foodPos.x = Math.floor(Math.random() * Math.floor(canvas.width));
            foodPos.y = Math.floor(Math.random() * Math.floor(canvas.height));
        }

        function getDistanceToFood() {
            let snakeCenterPos = {x: segments[0].snakePos.x + segmentSize/2, y: segments[0].snakePos.y + segmentSize/2};
            let foodCenterPos = {x: foodPos.x + segmentSize/2, y: foodPos.y + segmentSize/2};
            return Math.hypot(snakeCenterPos.x-foodCenterPos.x, snakeCenterPos.y-foodCenterPos.y);
        }

        function getDistanceToSegment(segment) {
            headCenterPos = {x: segments[0].snakePos.x + segmentSize/2, y: segments[0].snakePos.y + segmentSize/2};
            segmentCenterPos = {x: segment.snakePos.x + segmentSize/2, y: segment.snakePos.y + segmentSize/2};
            return Math.hypot(headCenterPos.x-segmentCenterPos.x, headCenterPos.y-segmentCenterPos.y);

        }

        function die() {
            clearInterval(updateInterval);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.getElementById("points").innerHTML = "Game Over. You scored " + points + " points";
            document.getElementById("points").style.fontSize = "3em";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        let frequencyData;
        let analayzer;
        function initializeAudioAnylizer() {
            const audio = document.querySelector("audio");
            const ctx = new AudioContext();
            const audioSource = ctx.createMediaElementSource(audio);
            analayzer = ctx.createAnalyser();

            audioSource.connect(analayzer);
            audioSource.connect(ctx.destination);

            frequencyData = new Uint8Array(analayzer.frequencyBinCount);
            analayzer.getByteFrequencyData(frequencyData);
            audio.play();
        }

        function getAudioFrequencyVariation() {
            let condensedArray = [];
            analayzer.getByteFrequencyData(frequencyData);
            let next = 0;
            for(let i = 0; i < frequencyData.length; i+=3) {
                condensedArray[next] = frequencyData[i];
                next++;
            }
            return condensedArray;
        }

        let oscillateDirection = -1;

        function applyMusicVariation(segmentIndex) {
                let plusOrMinus = 1;
                let musicSensitivity = 50;
                let frequencyVariation = getMusicAverages();//getAudioFrequencyVariation();
                let maxFrequencies = 200;
                let highFrequencyMultiplier = 5;
                let lowFrequencyMultiplier = 1;
                let indexMultiplier = 1;
                let musicVariation;
                let maxDistance = 5;
                if(segmentIndex%2==0) {
                    musicVariation = (frequencyVariation[1]*lowFrequencyMultiplier/(musicSensitivity));
                } else {
                    musicVariation = -(frequencyVariation[0]*highFrequencyMultiplier/(musicSensitivity))
                    
                }
                segments[segmentIndex].snakePos.x += plusOrMinus*musicVariation*segments[segmentIndex].direction.up*oscillateDirection;
                segments[segmentIndex].snakePos.y += plusOrMinus*musicVariation*segments[segmentIndex].direction.right*oscillateDirection;
        }

        function getMusicAverages() {
            let frequencies = getAudioFrequencyVariation();
            let bassStart = 20;
            let bassEnd = 20;
            let trebleStart = 0;
            let trebleEnd = 0;
            let bassAverage = 0;
            let trebleAverage = 0;
            for(let i = bassStart; i < (frequencies.length/2)-bassEnd; i++) {
                bassAverage+=frequencies[i];
            }
            bassAverage = bassAverage/((frequencies.length/2)-bassStart-bassEnd);
            for(let i = (frequencies.length/2)+trebleStart; i < frequencies.length-trebleEnd; i++) {
                trebleAverage+=frequencies[i];
            }
            trebleAverage = trebleAverage/((frequencies.length/2)-trebleStart-trebleEnd);
            return [bassAverage, trebleAverage];
        }