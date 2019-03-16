import { global, vues, poppers, messageQueue, modRes } from './vars.js';

export function arpa(type) {
    switch(type){
        case 'Physics':
            physics();
            break;
        case 'Genetics':
            genetics();
            break;
    }
}

const arpaProjects = {
    lhc: {
        title: 'Supercollider',
        desc: 'A supercollider will help expand your understanding of theoretical sciences',
        reqs: { high_tech: 6 },
        grant: 'supercollider',
        effect: function() {
            let sc = global.tech['particles'] && global.tech['particles'] >= 3 ? 8 : 4;
            if (global.tech['storage'] >= 6){
                return `Each completed supercollider increases wardenclyffe and university science caps by ${sc}%. They also boost warehouse capacty by 5%.`;
            }
            else {
                return `Each completed supercollider increases wardenclyffe and university science caps by ${sc}%.`;
            }
        },
        cost: {
            Money: function(){ return costMultiplier('lhc', 2500000, 1.05); },
            Knowledge: function(){ return costMultiplier('lhc', 500000, 1.05); },
            Copper: function(){ return costMultiplier('lhc', 125000, 1.05); },
            Cement: function(){ return costMultiplier('lhc', 250000, 1.05); },
            Steel: function(){ return costMultiplier('lhc', 187500, 1.05); },
            Titanium: function(){ return costMultiplier('lhc', 50000, 1.05); },
            Polymer: function(){ return costMultiplier('lhc', 12000, 1.05); }
        }
    },
    stock_exchange: {
        title: 'Stock Exchange',
        desc: 'The stock exchange will boost the amount of money your banks can trade in.',
        reqs: { banking: 9 },
        grant: 'stock_exchange',
        effect: function() {
            return 'Each level of stock exchange will boost bank capacity by 10%';
        },
        cost: {
            Money: function(){ return costMultiplier('stock_exchange', 3000000, 1.06); },
            Knowledge: function(){ return costMultiplier('stock_exchange', 200000, 1.06); },
            Copper: function(){ return costMultiplier('stock_exchange', 225000, 1.06); },
            Cement: function(){ return costMultiplier('stock_exchange', 400000, 1.06); },
            Steel: function(){ return costMultiplier('stock_exchange', 235000, 1.06); }
        }
    },
    launch_facility: {
        title: 'Launch Facility',
        desc: 'A launch facility allows for construction and firing of rockets.',
        reqs: { high_tech: 7, locked: 1 },
        grant: 'launch_facility',
        effect: function() {
            return 'Each level of stock exchange will boost bank capacity by 10%';
        },
        cost: {
            Money: function(){ return costMultiplier('launch_facility', 4000000, 1.1); },
            Knowledge: function(){ return costMultiplier('launch_facility', 500000, 1.1); },
            Cement: function(){ return costMultiplier('launch_facility', 200000, 1.1); },
            Oil: function(){ return costMultiplier('launch_facility', 20000, 1.1); },
            Steel: function(){ return costMultiplier('launch_facility', 250000, 1.1); },
            Alloy: function(){ return costMultiplier('launch_facility', 25000, 1.1); }
        }
    }
};

function checkRequirements(tech){
    var isMet = true;
    Object.keys(arpaProjects[tech].reqs).forEach(function (req) {
        if (!global.tech[req] || global.tech[req] < arpaProjects[tech].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

function payCosts(costs){
    costs = adjustCosts(costs);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global['resource'][res].amount -= costs[res]() / 100;
        });
        return true;
    }
    return false;
}

function checkCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        var testCost = Number(costs[res]()) / 100;
        if (testCost > Number(global['resource'][res].amount)) {
            test = false;
            return false;
        }
    });
    return test;
}

function adjustCosts(costs){
    if (global.race['creative']){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            newCosts[res] = function(){ return Math.round(costs[res]() * 0.98) || 0; }
        });
        return rebarAdjust(newCosts);
    }
    return costs;
}

function costMultiplier(project,base,mutiplier){
    var rank = global.arpa[project] ? global.arpa[project].rank : 0;
    return Math.round((mutiplier ** rank) * base);
}

function physics(){
    let parent = $('#arpaPhysics');
    parent.empty();
    addProject(parent,'lhc');
    addProject(parent,'stock_exchange');
    addProject(parent,'launch_facility');
}

function genetics(){

}

function addProject(parent,project){
    if (checkRequirements(project)){
        if (!global.arpa[project]){
            global.arpa[project] = {
                complete: 0,
                rank: 0
            };
        }
        let current = $(`<div id="arpa${project}" class="arpaProject"></div>`);
        parent.append(current);

        let head = $(`<div class="head"><span class="desc has-text-warning">${arpaProjects[project].title}</span><span v-show="rank" class="rank">Level - {{ rank }}</span></div>`);
        current.append(head);

        let progress = $(`<div class="pbar"><progress class="progress" :value="complete" max="100"></progress><span class="progress-value has-text-danger">{{ complete }}%</span></div>`);
        head.append(progress);

        let buy = $('<div class="buy"></div>');
        current.append(buy);

        buy.append($(`<button class="button x1" @click="build('${project}',1)">1%</button>`));
        buy.append($(`<button class="button x10" @click="build('${project}',10)">10%</button>`));
        buy.append($(`<button class="button x25" @click="build('${project}',25)">25%</button>`));
        buy.append($(`<button class="button x100" @click="build('${project}',100)">100%</button>`));

        vues[`arpa${project}`] = new Vue({
            data: global.arpa[project],
            methods: {
                build(pro,num){
                    for (let i=0; i<num; i++){
                        if (payCosts(arpaProjects[pro].cost)){
                            global.arpa[pro].complete++;
                            if (global.arpa[pro].complete >= 100){
                                global.arpa[pro].rank++;
                                global.arpa[pro].complete = 0;
                                global.tech[arpaProjects[pro].grant] = global.arpa[pro].rank;
                            }
                        }
                    }
                }
            }
        });
        vues[`arpa${project}`].$mount(`#arpa${project}`);

        $(`#arpa${project} .head .desc`).on('mouseover',function(){
            var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark">${arpaProjects[project].desc}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[`popArpa${project}`] = new Popper($(`#arpa${project} .head`),popper);
        });
        $(`#arpa${project} .head .desc`).on('mouseout',function(){
            $(`#popArpa${project}`).hide();
            poppers[`popArpa${project}`].destroy();
            $(`#popArpa${project}`).remove();
        });

        $(`#arpa${project} .head .rank`).on('mouseover',function(){
            let effect = arpaProjects[project].effect();
            var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark">${effect}</div>`);
            $('#main').append(popper);
            popper.show();
            poppers[`popArpa${project}`] = new Popper($(`#arpa${project} .head`),popper);
        });
        $(`#arpa${project} .head .rank`).on('mouseout',function(){
            $(`#popArpa${project}`).hide();
            poppers[`popArpa${project}`].destroy();
            $(`#popArpa${project}`).remove();
        });

        let classes = ['1','10','25','100'];
        for (let i=0; i<classes.length; i++){
            let id = classes[i];
            $(`#arpa${project} .buy .x${id}`).on('mouseover',function(){
                var cost = $('<div></div>');
                var costs = arpaProjects[project].cost;
                Object.keys(costs).forEach(function (res) {
                    var res_cost = costs[res]() * (id / 100);
                    if (res_cost > 0){
                        var label = res === 'Money' ? '$' : res+': ';
                        var color = global.resource[res].amount >= res_cost ? 'has-text-dark' : 'has-text-danger';
                        cost.append($(`<div class="${color}">${label}${res_cost}</div>`));
                    }
                });
                var popper = $(`<div id="popArpa${project}" class="popper has-background-light has-text-dark"></div>`);
                popper.append(cost);
                $('#main').append(popper);
                popper.show();
                poppers[`popArpa${project}`] = new Popper($(`#arpa${project}`),popper);
            });
            $(`#arpa${project} .buy .x${id}`).on('mouseout',function(){
                $(`#popArpa${project}`).hide();
                poppers[`popArpa${project}`].destroy();
                $(`#popArpa${project}`).remove();
            });
        }
    }
}