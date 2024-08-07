
//定義html物件變成array
var htmllabels=['part0','part1','part2','part3','part4','part5','part6','part7','part8','part9','part10','part11','part12','part13','part14','part15','part16','part17']
var htmlcolorselect=['color0','color1','color2','color3','color4','color5','color6','color7','color8','color9','color10','color11','color12','color13','color14','color15','color16','color17']
//colors顏色們
//colornames顏色名稱
//dancersettings舞者的設定
//dancersettings["dancers"][dancersettings["dancersname"][nowdancer]]["parts"] i舞者的部位們

function reloadselect(select,array){
    select.innerHTML = '';

    // 遍歷數組並創建選項
    array.forEach((optionText, index) => {
        // 創建一個新的 option 元件
        const optionElement = document.createElement('option');
        optionElement.textContent = optionText;
        optionElement.value = index; // 可選：設置 option 的值

        // 將 option 添加到 select 元件中
        select.appendChild(optionElement);
    });
}


function reloadeditor(segment) {
    document.getElementById("nowframe").innerText = segment.toString();
    
    let nowframe_time = frametime[segment];
    document.getElementById("nowframetime").innerText = nowframe_time.toString();
    
    let partsnum = dancersettings["dancers"][dancersettings["dancersname"][nowdancer]]["parts"].length;
    
    for (let i = 0; i < partsnum; i++) {
        let partlabel = document.getElementById(htmllabels[i]);
        let colorselect = document.getElementById(htmlcolorselect[i]);
        
        partlabel.innerText = dancersettings["dancers"][dancersettings["dancersname"][nowdancer]]["parts"][i];
    }
    for (let i = 0; i < 18-partsnum; i++) {
        let partlabel = document.getElementById(htmllabels[17-i]);
        let colorselect = document.getElementById(htmlcolorselect[17-i]);
        
        partlabel.style.display = "none";
    }
}

function initializeEditor(){
    dancername=dancersettings["dancersname"];
    dancerselect=document.getElementById("Dancers");
    reloadselect(dancerselect,dancername)
}