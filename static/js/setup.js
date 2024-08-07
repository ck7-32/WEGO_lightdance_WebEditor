let wavesurfer;
var regionsPlugin = WaveSurfer.regions.create();
var markersPlugin = WaveSurfer.markers.create();
let markers = [];
let audiopath;



function getCurrentTime() {
    var currentTime = wavesurfer.getCurrentTime();
    console.log('Current Time:', currentTime);
    
}

function setTime(time) {
    const duration = wavesurfer.getDuration();
    const progress = time / duration;
    wavesurfer.seekTo(progress);
}

async function updateFrameTimes(regions) {
    const frametimes = regions.map(region => region.start * 1000); // 转换为毫秒
    frametimes.push(regions[regions.length - 1].end * 1000); // 添加最后一个区域的结束时间

    const data = { frametimes };

    try {
        const response = await fetch('/update-fraetimes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Frame times updated:', result);
    } catch (error) {
        console.error('Error updating frame times:', error);
    }
}

function reloadRegions() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const frametimes = data.frametimes;
            wavesurfer.clearRegions(); // 清除现有的regions
            for (let i = 0; i < frametimes.length ; i++) {
                const startTime = frametimes[i] / 1000; // 转换为秒
                const endTime = frametimes[i + 1] / 1000; // 转换为秒
                wavesurfer.addRegion({
                    start: startTime,
                    end: endTime,
                    color: i % 2 === 0 ? 'rgba(50, 0, 0, 0.5)' : 'rgba(0, 50, 0, 0.5)', // 基数偶数段不同颜色
                    resize: false, // 允许调整大小
                    drag: false // 允许拖动
                });
            }
            // 添加最后一个时间点的标记
            const lastStartTime = frametimes[frametimes.length ] / 1000;
            wavesurfer.addRegion({
                start: lastStartTime,
                end: lastStartTime + 0.5, // 给最后一个标记一个默认的持续时间
                color: frametimes.length % 2 === 0 ? 'rgba(50, 0, 0, 0.5)' : 'rgba(0, 50, 0, 0.5)', // 基数偶数段不同颜色
                resize: false, // 允许调整大小
                drag: false // 允许拖动
            });
        })
        .catch(error => console.error('Error loading data.json:', error));
        return;
}


        // 增加滑動條的值
function increaseSliderValue() {
    var slider = document.getElementById('zoom-slider');
    var currentValue = parseInt(slider.value, 10);
    if (currentValue < slider.max) {
        slider.value = currentValue + 5;
        updateDisplayValue(slider.value);
        wavesurfer.zoom(Number( slider.value));
    }
}

// 減少滑動條的值
function decreaseSliderValue() {
    var slider = document.getElementById('zoom-slider');
    var currentValue = parseInt(slider.value, 10);
    if (currentValue > slider.min) {
        slider.value = currentValue - 5;
        updateDisplayValue(slider.value);
        wavesurfer.zoom(Number( slider.value));
    }
}

// 更新顯示值
function updateDisplayValue(value) {
    var displayValue = document.getElementById('zoom-slider');
  wavesurfer.zoom(Number(value));
   
}

// 当網頁載入完成後執行的函式

function scrollWaveSurferLeft() {
    var currentScroll = wavesurfer.drawer.wrapper.scrollLeft;
    if (currentScroll > 0) {
        wavesurfer.drawer.wrapper.scrollLeft = currentScroll - 10; // 每次滾動 10px
    }
}

function scrollWaveSurferRight() {
    var currentScroll = wavesurfer.drawer.wrapper.scrollLeft;
    wavesurfer.drawer.wrapper.scrollLeft = currentScroll + 10; // 每次滾動 10px
 
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}
async function initializeAudio() {
    try {
        const data = await fetchData(settingUrl);
        audiopath = `/static/${data.audio}`;
        console.log('Audio path initialized:', audiopath);
        await initializeWaveSurfer();
    } catch (error) {
        console.error('Error initializing audio:', error);
    }
}

async function initializeWaveSurfer() {
   
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#FFFFFF',
        progressColor: '#8a8a8a',
        height: 120,
        hideScrollbar: true,
        interact: true,
        plugins: [
            regionsPlugin,
            markersPlugin,
            WaveSurfer.minimap.create({
            container: '#minimap',
            waveColor: '#FFFFFF',
            progressColor: '#777',
            height: 35
            })  ,
            
        ]
    });


    if (!regionsPlugin || !markersPlugin) {
        console.error('WaveSurfer 插件未正确初始化');
        return;
    }

    // 加载音频
    try {
        await wavesurfer.load(audiopath);
    } catch (error) {
        console.error('加载音频时出错:', error);
        return;
    }
    // 加载音频
    await wavesurfer.load(audiopath);

    wavesurfer.on('ready', () => {
        console.log('WaveSurfer is ready');
        loadDataFromJSON();
        console.log('載入數據');
        setupEventListeners();
        console.log('綁定事件');
        var slider = document.getElementById('zoom-slider');
        console.log('綁定滑動條');
        slider.addEventListener('input', function() {
        updateDisplayValue(this.value);
        });
        Object.assign(window, {
            wavesurfer,
        });

        // 启动动画
        var startTime = (new Date()).getTime();
        animate(darr, canvas, ctx, startTime);
    });
}

function setupEventListeners() {
    wavesurfer.on('region-update-end', updateJSON);
    wavesurfer.on('marker-drop', function(marker) {
        updateMarker(marker.label,marker.time);
    });
}


function updateMarker(id,newtime) {
    handler.updateframe(id, newtime);
}

function updateJSON() {
    const data = { 
        frametimes: regionsPlugin.getRegions().map(r => r.start * 1000),
        markers: markers.map(m => m.time * 1000)
    };
    localStorage.setItem('audioData', JSON.stringify(data));
    updateFrameTimes(regionsPlugin.getRegions());
}

function loadDataFromJSON() {
    const savedData = localStorage.getItem('audioData');
    if (savedData) {

        loadData(JSON.parse(savedData));
        
    } else {
        console.log('載入數據1');
        fetch(dataUrl)
            .then(response => response.json())
            .then(data => {
                loadData(data);
            })
            .catch(error => console.error('Error loading data:', error));
    }
}

function loadData(data) {
        // 加载 regions
        wavesurfer.clearRegions();

        if (data.frametimes) {
            for (let i = 0; i < data.frametimes.length - 1; i++) {
                const startTime = data.frametimes[i] / 1000;
                const endTime = data.frametimes[i + 1] / 1000;
                wavesurfer.addRegion({
                    start: startTime,
                    end: endTime,
                    color: i % 2 === 0 ? 'rgba(50, 0, 0, 0.5)' : 'rgba(0, 50, 0, 0.5)',
                    resize: false,
                    drag: false
                });
            }
        }

        // 加载 markers
       
        wavesurfer.clearMarkers();
        

        markers = [];
        if (data.frametimes) {
            data.frametimes.forEach((time, index) => {
                const markerId = wavesurfer.addMarker({
                    time: time / 1000,
                    color: 'rgba(120, 179, 150, 1)',
                    position: 'top',
                    id:index.toString(),
                    label:index.toString(),
                    draggable: true
                });
                markers.push({ id: markerId, time: time / 1000 });
            });
        }
    }
Object.assign(window, {
loadDataFromJSON,
initializeWaveSurfer,
initializeAudio,
fetchData,
getCurrentTime,
setTime,
reloadRegions,
increaseSliderValue,
decreaseSliderValue,
scrollWaveSurferLeft,
scrollWaveSurferRight,
});