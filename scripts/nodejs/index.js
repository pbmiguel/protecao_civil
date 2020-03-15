const axios = require('axios');
const fs = require('fs');

const PAGE_SIZE = 50;

async function main(distritoId, dateI, dateF){
    var output = [];
    try{
        var responseRaw = await getData(distritoId, dateI, dateF, 1);
    }catch(ex){
        console.log(`error when distrito=${distritoId} dateI=${dateI} dateF=${dateF} index=${1}`);
        return;
    }
     
    var response = parseData(responseRaw);
    const nrLoops = Math.ceil(response["Total"] / PAGE_SIZE);

    //
    output = response["Data"];

     for(var i = 2; i < nrLoops; i++){
         try{
            responseRaw = await getData(distritoId, dateI, dateF, i);
            response = parseData(responseRaw);
            output = output.concat(response["Data"]);
        }catch(ex){
            console.log(`error when distrito=${distritoId} dateI=${dateI} dateF=${dateF} index=${i}`);
         }
     }

     console.log(output.length);
     return output;
}

function parseData(response){
    var parsedres = response.data;
    const res = JSON.parse(JSON.stringify(parsedres.GetHistoryOccurrencesSearchRangeResult));
    return res["ArrayInfo"][0];
}

async function getData(distritoID, dateI, dateF, pageIndex = 1){
    console.log(`getting data distritoID=${distritoID} dateI=${dateI} dateF=${dateF} pageIndex=${pageIndex}`)
    const url = `http://www.prociv.pt/_vti_bin/ARM.ANPC.UI/ANPC_SituacaoOperacional.svc/GetHistoryOccurrencesSearchRange`;
    const body = {
        "pageSize": PAGE_SIZE,
        "pageIndex": pageIndex,
        "distritoID": distritoID, 
        "dataOcorrencia": `/Date(${dateI}+0000)/`,
        "dataFechoOperacional":`/Date(${dateF}+0000)/`
    }

    return axios.post(url, body);
}

const DISTRITOID = 19;
const DATEI = new Date(2020, 1, 1).getTime();
const DATEF = new Date(2020, 1, 8).getTime();

main(DISTRITOID,DATEI, DATEF ).then(res => {
    //
    fs.writeFileSync("response.json", JSON.stringify(res));
})
