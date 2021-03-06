var DEBUG=true

var minbuy=1
var maxbuy=1000
var startTime=0

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
  document.getElementById('swapButton').onclick=swap2;
  //document.getElementById('donateButton').onclick=donate2;

  web3.eth.getAccounts(function (err, accounts) {
    let addr=accounts[0]
    oldEthAddress=addr
    tokenContract.methods.balanceOf(addr).call().then(function(bal){
      document.getElementById('tokenBalance').textContent=weiToDisplay(bal)
    })
    tokenContract.methods.moundIndex(addr).call().then(function(mindex){
      document.getElementById('top50').textContent=Number(mindex)>0
    })
    tokenContract.methods.totalBurned().call().then(function(tburned){
      document.getElementById('totalburned').textContent=weiToDisplay(tburned)
    })
    tokenContract.methods.totalSupply().call().then(function(tokenTotal){
      document.getElementById('total').textContent=weiToDisplay(tokenTotal)
    })
    swapContract.methods.nextSwap().call().then(function(nextSwap){
      startTime=Number(nextSwap)
    })
    processRecentEvents()
    //updateReflink()
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
              addToList('recentrewards',weiToDisplay(eventResult.returnValues._value)+" "+eventResult.returnValues._addr+" "+timedisplay)
              count++
              if(usercount<MAX_LIST_ELEMENTS && eventResult.returnValues._addr==accounts[0]){
                //console.log('found user payout event ')
                addToList('yourrecentrewards',weiToDisplay(eventResult.returnValues._value)+" "+timedisplay)
                usercount++
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

  document.getElementById('hours').textContent=hours
  document.getElementById('minutes').textContent=minutes
  document.getElementById('seconds').textContent=seconds.toFixed(2)
}
function weiToDisplay(wei){
    return formatEthValue(web3.utils.fromWei(wei,'ether'))
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
