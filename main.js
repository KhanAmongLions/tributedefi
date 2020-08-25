var DEBUG=true

var minbuy=1
var maxbuy=1000
var startTime=0
var startTimeLottery=0
var deployTime=1598224286//+7*24*60*60//1596996282//+7*24*60*60
var lotteryWeekHasPassed=false

function main(){
    if(DEBUG){console.log('test')}
    refreshData()
    window.setInterval('refreshData()',2500)
    web3.eth.getBlockNumber().then(function(bnum){
      tokenContract.events.Choosen({},transferPayoutCallback)
    })
    controlLoopFaster()
}
function controlLoopFaster(){
    //put faster update stuff here
    refreshTimers()
    setTimeout(controlLoopFaster,30)
}
function refreshData(){
  console.log('refreshdata called')
  document.getElementById('buyButton').onclick=buy2;//LOCKStakeAmount
  document.getElementById('sellButton').onclick=sell2;
  document.getElementById('withdrawDivs').onclick=withdraw2;
  document.getElementById('reinvestDivs').onclick=reinvest2;
  document.getElementById('swapButton').onclick=swap2;
  document.getElementById('approveButton').onclick=approve2;
  document.getElementById('donateButton').onclick=donate2;
  document.getElementById('lotteryButton').onclick=enterLottery2;
  //document.getElementById('donateButton').onclick=donate2;
  //buyresult sellresult

  web3.eth.getAccounts(function (err, accounts) {
    let addr=accounts[0]
    oldEthAddress=addr
    tokenContract.methods.balanceOf(addr).call().then(function(bal){
      document.getElementById('tokenBalance').textContent=weiToDisplay(bal)
      document.getElementById('tokenBalance2').textContent=weiToDisplay(bal)
      document.getElementById('tokenBalance3').textContent=weiToDisplay(bal)
    })
    tokenContract.methods.moundIndex(addr).call().then(function(mindex){
      window.mindex=mindex
      document.getElementById('top50').textContent=(Number(mindex)>0)?'Yes':'No'//mindex//
    })
    // tokenContract.methods.totalBurned().call().then(function(tburned){
    //   document.getElementById('totalburned').textContent=weiToDisplay(tburned)
    //   document.getElementById('totalburned2').textContent=weiToDisplay(tburned)
    //   //document.getElementById('burnedcounter').setAttribute("data-stop",web3.utils.fromWei(tburned,'ether'))
    // })
    tokenContract.methods.totalSupply().call().then(function(tokenTotal){
      document.getElementById('total').textContent=weiToDisplay(tokenTotal)
      document.getElementById('total2').textContent=weiToDisplay(tokenTotal)
      document.getElementById('totalburned').textContent=parseFloat((500000-Number(web3.utils.fromWei(tokenTotal,'ether'))).toFixed(0)).toLocaleString()
      document.getElementById('totalburned2').textContent=parseFloat((500000-Number(web3.utils.fromWei(tokenTotal,'ether'))).toFixed(0)).toLocaleString()
      //circsupplycounter
      //document.getElementById('circsupplycounter').setAttribute("data-stop",web3.utils.fromWei(tokenTotal,'ether'))
    })
    svContract.methods.totalSupply().call().then(function(totalbal){
      document.getElementById('totalShares').textContent=weiToDisplay(totalbal)
      svContract.methods.balanceOf(addr).call().then(function(bal){
        var totalbalnum=Number(web3.utils.fromWei(totalbal,'ether'))
        var balnum=Number(web3.utils.fromWei(bal,'ether'))
        var percentShares=((balnum/totalbalnum)*100)
        if(percentShares>1){
          document.getElementById('yourShares').textContent=weiToDisplay(bal)+" ("+percentShares.toFixed(2)+"%)"
        }
        else{
          document.getElementById('yourShares').textContent=weiToDisplay(bal)
        }
      })
    })

    svContract.methods.myDividends(true).call({from:addr}).then(function(bal){
      document.getElementById('yourdivs').textContent=weiToDisplay(bal)
    })
    swapContract.methods.nextSwap().call().then(function(nextSwap){
      startTime=Number(nextSwap)
    })
    lotteryContract.methods.current_round().call().then(function(round){
      lotteryContract.methods.totalRoundTokens(round).call().then(function(totalTokens){
        document.getElementById('tokensenteredtotal').textContent=weiToDisplay(totalTokens)
        lotteryContract.methods.token_count_by_address(round,addr).call().then(function(tokens){
          document.getElementById('tokensentered').textContent=weiToDisplay(tokens)
          if(totalTokens>0){
            var chancetowin=(100*Number(tokens)/Number(totalTokens)).toFixed(2)
            document.getElementById('chancetowin').textContent=chancetowin
          }
          else{
            document.getElementById('chancetowin').textContent=0
          }
        })
      })
    })
    lotteryContract.methods.lastDrawing().call().then(function(lastDrawing){
      lotteryContract.methods.minTimeBetweenDrawings().call().then(function(minTime){
        //startTimeLottery=minTime+lastDrawing
        //console.log('drawing time ',minTime,lastDrawing)
        if(lastDrawing==0){
          lotteryWeekHasPassed=false;
        }
        else{
          var currentTime=new Date().getTime() / 1000
          lotteryWeekHasPassed=(currentTime-Number(lastDrawing))>7*24*60*60
          //console.log('lwhp ',lotteryWeekHasPassed)
        }

      })
    })
    var currentTime=new Date().getTime() / 1000
    var nextDrawing=deployTime
    while(nextDrawing<currentTime){
      nextDrawing+=7*24*60*60
    }
    //console.log('difference ',(nextDrawing-currentTime)/(24*60*60),nextDrawing)
    if(lotteryWeekHasPassed){
      startTimeLottery=0
    }
    else{
      startTimeLottery=nextDrawing
    }

    if(liqTokenContract){
      liqTokenContract.methods.balanceOf(addr).call().then(function(bal){
        document.getElementById('liqTokenBalance').textContent=weiToDisplay(bal)
      })
    }

    processRecentEvents()
    updateReflink()
  })
}
function addToList(listid,content){
  var list = document.getElementById(listid);
  var entry = document.createElement('li');
  entry.appendChild(document.createTextNode(content));
  list.appendChild(entry);
}
MAX_LIST_ELEMENTS=7
lastevent=null
//web3.eth.getBlock()
function processRecentEvents(){
  web3.eth.getAccounts(function (err, accounts) {
    web3.eth.getBlockNumber().then(function(bnum){
      tokenContract.getPastEvents("Choosen",{ fromBlock: (bnum-20000)+'', toBlock: 'latest' },function(error,events){
        events=events.reverse()
        $("#recentrewards").empty()
        $("#yourrecentrewards").empty()
        var count=0
        var usercount=0
        events.forEach(function(eventResult){
          //web3.eth.getBlock(eventResult.blockNumber).then(function(block){
            lastevent=eventResult
            if (error){
              console.log('Error in myEvent event handler: ' + error);
            }
            else if(count<MAX_LIST_ELEMENTS){
              //console.log('myEvent: ' + JSON.stringify(eventResult.returnValues));
              var timedisplay=""//new Date(1000*block.timestamp)
              if(eventResult.returnValues._addr!='0x0000000000000000000000000000000000000000'){
                addToList('recentrewards',weiToDisplay(eventResult.returnValues._value)+" "+eventResult.returnValues._addr+" "+timedisplay)
                count++
                if(usercount<MAX_LIST_ELEMENTS && eventResult.returnValues._addr==accounts[0]){
                  //console.log('found user payout event ')
                  addToList('yourrecentrewards',weiToDisplay(eventResult.returnValues._value)+" "+timedisplay)
                  usercount++
                }
              }

            }
          //})
        })
      });
    })
  })
}
function refreshTimers(){
  var nowtime=new Date().getTime()/1000
  setTimerFromSeconds(Number(startTime)-nowtime)
  setTimerFromSeconds2(Number(startTimeLottery)-nowtime)
  // if(nowtime>startTime){
  // }
  // else{
  //
  // }
}
function disableButton(buttonId){
  //console.log('placeholder, button disabled ',buttonId)
  document.getElementById(buttonId).disabled=true
}
function enableButton(buttonId){
  //console.log('placeholder, button enabled ',buttonId)
  document.getElementById(buttonId).disabled=false
}
function setTimerFromSeconds(seconds){
  //console.log('secondssettimer ',seconds)
  if(seconds<0){
    seconds=0//86400
  }
  var days        = 0//Math.floor(seconds/24/60/60);
  var hoursLeft   = Math.floor((seconds))// - (days*86400));
  var hours       = Math.floor(hoursLeft/3600);
  var minutesLeft = Math.floor((hoursLeft) - (hours*3600));
  var minutes     = Math.floor(minutesLeft/60);
  var remainingSeconds = seconds % 60;
  setTimer(days,hours,minutes,remainingSeconds)
}
function setTimer(days,hours,minutes,seconds){
  //console.log('settimer ',days,hours,minutes,seconds)
  //document.getElementById('days').textContent=days
  document.getElementById('hours').textContent=(hours+'').padStart(2,'0')
  document.getElementById('minutes').textContent=(minutes+'').padStart(2,'0')
  document.getElementById('seconds').textContent=(seconds.toFixed(0)+'').padStart(2,'0')
}
function setTimerFromSeconds2(seconds){
  //console.log('secondssettimer ',seconds)
  if(seconds<0){
    seconds=0//86400
  }
  var days        = Math.floor(seconds/24/60/60);
  var hoursLeft   = Math.floor((seconds) - (days*86400));
  var hours       = Math.floor(hoursLeft/3600);
  var minutesLeft = Math.floor((hoursLeft) - (hours*3600));
  var minutes     = Math.floor(minutesLeft/60);
  var remainingSeconds = seconds % 60;
  setTimer2(days,hours,minutes,remainingSeconds)
}
function setTimer2(days,hours,minutes,seconds){
  //console.log('settimer ',days,hours,minutes,seconds)
  document.getElementById('days2').textContent=(days+'').padStart(2,'0')
  document.getElementById('hours2').textContent=(hours+'').padStart(2,'0')
  document.getElementById('minutes2').textContent=(minutes+'').padStart(2,'0')
  document.getElementById('seconds2').textContent=(seconds.toFixed(0)+'').padStart(2,'0')
}
function weiToDisplay(wei){
    return formatEthValue(web3.utils.fromWei(wei,'ether')).toLocaleString()
}
function formatEthValue(ethstr){
    return parseFloat(parseFloat(ethstr).toFixed(2));
}
function buy2(){
  if(DEBUG){console.log('buy2')}
  let tospend=document.getElementById('buyamount').value
  if(Number(tospend)>0){
      web3.eth.getAccounts(function (err, accounts) {
        address=accounts[0]
        refaddress=getRefToUse()//"0x9bEDbd434cEAda2ce139335f21905f8fF7894C5D"//"0xdd9919d12Db76ac8609078114c41098E44B732FD"
        console.log('buy ',svContractAddress,web3.utils.toWei(tospend,'ether'),address,refaddress)
        tokenContract.methods.approveAndCall(svContractAddress,web3.utils.toWei(tospend,'ether'),refaddress).send({from:address}).then(function(err,result){
          if(DEBUG){console.log('buy')}
        })
      })
  }
}
//svContract
function sell2(){
  if(DEBUG){console.log('sell2')}
  let tospend=document.getElementById('sellamount').value
  if(Number(tospend)>0){
      web3.eth.getAccounts(function (err, accounts) {
        address=accounts[0]
        svContract.methods.sell(web3.utils.toWei(tospend,'ether')).send({from:address}).then(function(err,result){
          if(DEBUG){console.log('sell')}
        })
      })
  }
}
function donate2(){
  if(DEBUG){console.log('sell2')}
  let tospend=document.getElementById('donateamount').value
  if(Number(tospend)>0){
      web3.eth.getAccounts(function (err, accounts) {
        address=accounts[0]
        svContract.methods.donateTokens(web3.utils.toWei(tospend,'ether')).send({from:address}).then(function(err,result){
          if(DEBUG){console.log('sell')}
        })
      })
  }
}
function withdraw2(){
  if(DEBUG){console.log('withdraw')}
  web3.eth.getAccounts(function (err, accounts) {
    address=accounts[0]
    svContract.methods.withdraw().send({from:address}).then(function(err,result){
      if(DEBUG){console.log('withdraw')}
    })
  })
}
function reinvest2(){
  if(DEBUG){console.log('reinvest')}
  web3.eth.getAccounts(function (err, accounts) {
    address=accounts[0]
    svContract.methods.reinvest().send({from:address}).then(function(err,result){
      if(DEBUG){console.log('reinvest')}
    })
  })
}
function swap2(){
  if(DEBUG){console.log('reinvest')}
  web3.eth.getAccounts(function (err, accounts) {
    address=accounts[0]
    swapContract.methods.swap().send({from:address}).then(function(err,result){
      if(DEBUG){console.log('reinvest')}
    })
  })
}
function approve2(){
  if(DEBUG){console.log('approve2')}
  web3.eth.getAccounts(function (err, accounts) {
    address=accounts[0]
    //document.getElementById('approvewaitingtransaction').style.display="inline-block";
    tokenContract.methods.approve(svContractAddress,web3.utils.toWei("100000000",'ether')).send({from:address}).then(function(err,result){
      if(DEBUG){console.log('approve')}
    })
  })
}
function enterLottery2(){
  if(DEBUG){console.log('enterLottery2')}
  let tospend=document.getElementById('buyamountLottery').value
  if(Number(tospend)>0){
      web3.eth.getAccounts(function (err, accounts) {
        address=accounts[0]
        console.log('buyL ',lotteryAddress,web3.utils.toWei(tospend,'ether'),address)
        tokenContract.methods.approveAndCall(lotteryAddress,web3.utils.toWei(tospend,'ether'),'0x0000000000000000000000000000000000000000').send({from:address}).then(function(err,result){
          if(DEBUG){console.log('buyL')}
        })
      })
  }
}
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
function copyRef() {
  console.log('copied reflink to clipboard')
  copyToClipboard(document.getElementById('myreflink'))
  alert('copied to clipboard '+document.getElementById('myreflink').textContent)
  //alert("Copied the text: " + copyText.value);
}
function updateReflink(){
  web3.eth.getAccounts(function (err, accounts) {
    var prldoc=document.getElementById('myreflink')
    prldoc.textContent=window.location.origin.replace('http://','https://')+"?ref="+accounts[0]
  })
}
function getRefToUse(){
  var reftouse=0;
  var urlref=getQueryVariable('ref')
  if(!urlref){
    urlref='0x0000000000000000000000000000000000000000'
  }
  reftouse=escape(urlref)
  if(reftouse.length!=42){
    reftouse='0x0000000000000000000000000000000000000000'
  }
  return reftouse
}
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
