import $ from 'jquery';
import Bootstrap from 'bootstrap/dist/css/bootstrap.min.css';

// Ni ska skapa en sida där en användare anger en SL-hållplats i ett sökfält för att sedan presentera alla dess 
//avgångar efter klockslaget sökningen sker på. Dvs nästa avgång(ar).

// Ni ska använda minst två av SLs api-metoder. En för att hämta hållplatser och en för att visa avgångar för given hållplats.

// Sökningen ska returnera en lista av hållplatser som matchar det användaren har skrivit fältet. Om den angivna hållplatsen inte finns så visa ingen lista.

// Användaren ska välja en av dessa hållplatser och sedan ska alla avgångar för den hållplatsen presenteras i en tabell. Varje avgång i tabellen ska presentera slutstation, klockslag och vilket fordon det gäller.

// Det ska finnas en Sök-knapp för att söka på hållplats men användaren ska också söka genom att trycka på Enter när denne har textfältet aktivt/fokuserat.

// Tillhörande tabellen av avgångar ska det finnas alternativ för att filtrera listan på fordon (tåg, buss, pendel). Vid filtrering så ska avgångarna uppdateras direkt (dvs, man ska inte behöva söka på hållplatsen igen).

// Det ska finnas en möjlighet att rensa sökfältet och alla avgångar.

// Sök-knappen ska vara avaktiverad tills användaren har fyllt i något i fältet.


// VG VG VG

// Visa en spinner eller progress bar när man söker på hållplatser och visar avgångar. Se till att spinner/progress bar är logiskt placerade relaterat till sökningen och laddningen av hållplatser och avgångar.

// * Utökad validering: Om den angivna hållplatsen inte finns så markera sök-fältet med röd färg och med text nedanför som säger ”Hållplatsen finns inte”.

// * Utökad validering: sök-knappen ska vara avaktiverad tills användaren har fyllt i fältet med en giltig avgång, dvs avgångar som endast finns i SLs databas.

// * Lägg till en knapp som uppdaterar avgångarna för en given hållplats utifrån klockslaget som uppdateringen skedde.

// * Användaren ska kunna klicka på en avgång för att se hela dess färd, alla hållplatser mellan start och slut-station. (Tips: Använd en modal. Det går dock att göra det på andra sätt som är mer UX-vänliga).

// * Visa matchande resultat i sökfälten medan användaren fyller i bokstav för bokstav. Detta kallas typeahead (bra att veta för google-sökning). (Tips! Börja denna sökning när användaren har angett minst tre bokstäver. Kan du se vilka fördelar det ger?)

// * Implementera sökhistorik i sökfältet för hållplatser. Den ska endast visa en lista av 5 senaste sökningarna när sökfältet är aktiverat. Listan försvinner när användaren börjar skriva i sökfältet. Om en ny hållplats tillkommer så ska den senast sparade hållplatsen försvinna och den nya läggs till överst (first in last out). (Tips! Använd sessionStorage. Det finns också localStorage, men varför rekommenderar vi inte det?)
let searchRealTime = "api/realtime/";
let searchStopsUrl = "api/search/";
let userSearchInput = "";
let output = "";
let isBuss = false;
let isPendel = false;
let isTunnelbana = false;
let isCheckbox = false;
let isHidden = false;
let isReset = false;
let isLoaded = false;
let stopAndId = [];
let stopAndidAndTime = [];
let tbanaArr = [];
let stopsOnRoute = [];
let filteredDepatures = [];
let btnCounter = 0; //show stop on route btn bounter
let checkbox = ` <fieldset id="fieldset"  class="hidden">
                   
              

        <div id="checkbox-container">
        
            <input type="checkbox" id="checkbox-tbanna" data-type="unloaded class="dim" />
            <label for="checkbox-tbanna" class="checkbox-tbanna-class checkbox-all">
                <i class="far fa-square"></i><span class="checkboxText">tunnelbanna</span>
            </label>

            <input type="checkbox" id="checkbox-buss" />
            <label for="checkbox-buss" class="checkbox-buss-class checkbox-all">
                <i id="fa-square-buss" class="far fa-square"></i><span class="checkboxText">buss</span>
            </label>

            <input type="checkbox" id="checkbox-pendel" />
            <label for="checkbox-pendel" class="checkbox-pendel-class checkbox-all">
                <i class="far fa-square"></i><span class="checkboxText">pendel</span>
            </label>

           
           

        </div>
       
       
       
    </fieldset>`


//window START
$(function () {
    
    $("#form-stop").submit(function (e) { //Prevent key ENTER to submit
        e.preventDefault();
    });

    $("#clear-all-text").on('click', function () {
        $('#form-stop').find('input:text, input:password, select, textarea').val('');
        resetShowData();
        isCheckbox = false;
        $("#search-btn").removeClass('active');



    });
    $("#search-input").keyup(function (e) { //Get value from input and send with key ENTER
       
        resetShowData();
        isCheckbox = false;
        userSearchInput = e.target.value;
        
        searchWithEnterKey(getStopLocation, e);
        loader();

    });

    $("#search-input").focus(() => {
        $('input:checkbox').removeAttr('checked');
        $("#checkbox-pendel").prop('checked', false);
        $("#checkbox-tbanna").prop('checked', false);
        $('#search-btn').removeClass('active');

    });

    $("#search-btn").on("click", function () { //Get Stops
        if(userSearchInput === ""){
            $(this).removeClass('active');
        }else{
            $(this).removeClass('inactive').addClass('active');
      
            resetShowData();
            getStopLocation();
            loader();
            isCheckbox = false;
        }
       
     
       

    });

    let searchWithEnterKey = (search, event) => {
        let key = event.which;
        isCheckbox = false;

        if (key == 13) // the enter key code
        {
            if(userSearchInput === ""){
                $("#search-btn").removeClass('active');
            }else{
                $("#search-btn").removeClass('inactive').addClass('active');
                search();
            }


        };
    };



    //------------------------------Get Stops
    function getStopLocation() { // Get STOPS
        console.log("getStopLocation");
        $.get(searchStopsUrl + userSearchInput, function (response) {
            resetShowData();
            $.each(response, function (key, value) {
                for (let i = 0; i < value.length; i++) {
                    output +=
                        `
                            <div class="${value[i].name}-container dim">
                            <div class="stop-container">
                            
                            <a href="#" class="specific-station ${value[i].id} ${value[i].name} dim" data-type="unloaded">${value[i].name}</a>  
                                  
                            </div>
                        </div>
                        `;
                    stopAndId.push({
                        'name': value[i].name,
                        'id': value[i].id
                    });
                }
            });
            document.querySelector("#show-data").innerHTML = output;

            showTime()

        }).fail(function (response) {
            console.log("fail");
            console.log(response);
        });;
    };

    //----------------------------
    function getDepatureTime(stopAndId, userClickStation) {
        console.log("getDepatureTime");
        let header = $(".specific-station").html();

        $(".specific-station").hide();
        let id;
        let product;

        for (const key in stopAndId) {
            if (stopAndId.hasOwnProperty(key)) {
                if (userClickStation === stopAndId[key].name) {
                    id = stopAndId[key].id;
                    console.log(id);
                    break;
                }
            }
        };

        $.get(searchRealTime + id + "/" + product, function (response) {

            $.each(response, function (key, value) {
                for (let i = 0; i < value.length; i++) {
                   
                    stopAndidAndTime.push({
                        'name': value[i].name,
                        'direction': value[i].direction,
                        'time': value[i].time.substring(0,  value[i].time.lastIndexOf(':')),
                        'transportation': value[i].Product.catCode,
                        ['stops']: value[i].Stops
                    });
                    // console.log(value[i].time + " " + value[i].name)
                    output = `
                    <a href="#" class="depature dim ${i}" data-destination="${stopAndidAndTime[i].direction}" status="unloaded">
                        ${stopAndidAndTime[i].time} ${stopAndidAndTime[i].direction} ${stopAndidAndTime[i].name} ${stopAndidAndTime[i].transportation} 
                        
                    </a>
                
                `;
                    $(`.${id}`).before(`<div>${output}</div> `);
                }
            });
           

            $("#fieldset").prepend(`<h1 class="heading">${header}</h1>`);

        

        });

        console.log(stopAndidAndTime);
    };

    function showTime() {
        console.log("ShowIme");
        $('.dim').click(function (event) {
            loader();
            $("#show-data").css("display", "none");
          
            $("#show-data").css("display", "block");
            $(`.stations`).html(`Hållplats: ${event.target.innerHTML}`);

            $(`.${event.target.classList[1]}`).addClass("loaded");

            $("#fieldset").removeClass("hidden");
            $("#fieldset").addClass("show");
            /////////////////////////////////////////////////////////////////////////////////
            if (isReset) {
                
                // $(`.${event.target.classList[1]}`).parent().parent().nextAll().addClass("hidden"); //DANGEROUS!
                $(`.${event.target.classList[1]}`).parent().attr("target-stop-container","target-stop-container");
                $('.stop-container').each(function(i, obj) {
                   if(!obj.hasAttribute("target-stop-container")){
                        obj.remove();
                   }
                    console.log(i + " " + obj.hasAttribute("target-stop-container"));
                });
                

            }
            showCheckBox();
            if ($(this).attr("data-type") === "unloaded") {
                $(this).attr("data-type", "loaded");
                getDepatureTime(stopAndId, event.target.innerHTML);

            }
        });
    };

    $(document).ajaxComplete(() => {
        getStopsInTrip();
        checkboxLogic();
    });

    // $(document).ajaxComplete(checkboxLogic);
    //---------------------------------------------------------------------filter transportation 
    let filterDepatures = (catCode) => { 
        let output = "";
       
        
        filteredDepatures = stopAndidAndTime.filter(function (obj) {
            // clearFilterDepatures(obj.transportation === catCode);
            // return  clearFilterDepatures(obj.transportation === catCode);
            return (obj.transportation === catCode);
        });
      
        for (let i = 0; i < filteredDepatures.length; i++) {
            output += `
            <div>
            <a href="#" class="depature dim ${i} direction" data-destination="${filteredDepatures[i].direction}" >
                ${filteredDepatures[i].time} ${filteredDepatures[i].direction} ${filteredDepatures[i].transportation}
            </a> 
            </div>`

        }
         return output;
        // return  `<ul class="stops-on-route" status="unloaded">${output}</ul>`;
    };
  
    function loader(){
        $(document).ajaxStart(()=>{
            $(".loader").addClass("start");
        });
        $(document).ajaxComplete(()=>{
            $(".loader").removeClass("start");
        });
    }

   
    
    //------------------------------------------------GET THE STOPS ON A SELECTED ROUTE!
    function getStopsInTrip() {
        $(".depature").click((e) => {
            btnCounter++;

            let destination = $(e.target).data("destination");
            let depatureClass = e.target.classList[2];
            console.log(depatureClass);
            let output = "";

            console.log(destination);
            let filteredDepatures;
            filteredDepatures = stopAndidAndTime.filter(function (obj) {
                return (obj.direction === destination);
            });
            for (let i = 0; i < filteredDepatures.length; i++) {
                console.log(filteredDepatures[i].stops)
                // console.log(stopAndidAndTime[i].stops.Stop[1].name + " " + "travelstops    ");
                for (let ii = 0; ii < filteredDepatures[i].stops.Stop.length; ii++) {
                    stopsOnRoute.push(filteredDepatures[i].stops.Stop[ii].name);
                    output += `<li>${filteredDepatures[i].stops.Stop[ii].name}</li>`;
                };
            }
            let test = `<ul class="stops-on-route" status="unloaded">${output}</ul>`;

            if(btnCounter === 1){
                $(`.${depatureClass}`).after(test);
            $(".stops-on-route").addClass("stops-on-route-style");
                
                 $(".stops-on-route").next().remove();
               
            }

            if(btnCounter === 2){
                $(".stops-on-route").html("");
                $(".stops-on-route").next().remove();
                btnCounter = 0;
            }
  
        });
    };

    let resetShowData = () => {
        $("#show-data").html("");
        stopAndidAndTime = [];
        output = "";
        $(".stop-container").removeClass("hidden");
        $(".stop-container").addClass("show");
        
        isReset = true;

    };

    ///////////////////////CHECKBOX

    function showCheckBox() {
        if (isCheckbox === false) {
            $("#show-data").prepend(checkbox);
            isCheckbox = true;
        }
    };

    // let clearFilterDepatures = (filteredDepatures) => {
    //     console.log("clearfilter");
       
    //     if(!isTunnelbana){
    //         console.log("not check")
    //          filteredDepatures.remove();
    //          return filteredDepatures;
    //      }else{
    //          return filteredDepatures;
    //      }
    //  };
 

    function checkboxLogic() {
        const OUTPUTNOFILTER = $(".stop-container").html();
        const TBANACATCODE = "5";
        const BUSCATCODE = "7";
        const PENDELCATCODE = "4";

        $("#checkbox-tbanna").on("click", function () {
            let check = $("#checkbox-tbanna").prop("checked");

            if (check) {
               
                if ($('.checkbox-tbanna-class i').hasClass('fa-square')) {
                    $('.checkbox-tbanna-class i').removeClass('fa-square').addClass('fa-check-square');
                    isTunnelbana = true;
                    isBuss = false;
                    isPendel = false;
                  
                    $(".stop-container").html(filterDepatures(TBANACATCODE));

                    loader();
                    getStopsInTrip();

                    $("#checkbox-tbanna").prop('checked', true);

                    $(".checkbox-pendel-class i").removeClass("fa-check-square");
                    $(".checkbox-buss-class i").removeClass("fa-check-square");
                    $(".checkbox-pendel-class i").addClass("fa-square");
                    $(".checkbox-buss-class i").addClass("fa-square");

                    $("#checkbox-buss").prop('checked', false);
                    $("#checkbox-pendel").prop('checked', false);


                }
            } else {
                if ($('.checkbox-tbanna-class i').hasClass('fa-check-square')) {
                    $('.checkbox-tbanna-class i').removeClass('fa-check-square').addClass('fa-square');
                    isTunnelbana = false;
                    output = ""
                    $(".stop-container").html(OUTPUTNOFILTER);
                    console.log(typeof filterDepatures());
                    getStopsInTrip();
                    



                }
            }

        });

        $("#checkbox-pendel").on("click", function () {
            let check = $("#checkbox-pendel").prop("checked");

            if (check) {
                if ($('.checkbox-pendel-class i').hasClass('fa-square')) {
                    $('.checkbox-pendel-class i').removeClass('fa-square').addClass('fa-check-square');
                    isPendel = true;
                    isBuss = false;
                    isTunnelbana = false;

                    $(".stop-container").html(filterDepatures(PENDELCATCODE));
                    getStopsInTrip();
                    loader();

                    $("#checkbox-pendel").prop('checked', true);

                    $(".checkbox-tbanna-class i").removeClass("fa-check-square");
                    $(".checkbox-buss-class i").removeClass("fa-check-square");
                    $(".checkbox-tbanna-class i").addClass("fa-square");
                    $(".checkbox-buss-class i").addClass("fa-square");

                    $("#checkbox-buss").prop('checked', false);
                    $("#checkbox-tbanna").prop('checked', false);

                }
            } else {
                if ($('.checkbox-pendel-class i').hasClass('fa-check-square')) {
                    $('.checkbox-pendel-class i').removeClass('fa-check-square').addClass('fa-square');
                    isPendel = false;
                    $(".stop-container").html(OUTPUTNOFILTER);
                    getStopsInTrip();
                    

                }
            }

        });
        $("#checkbox-buss").on("click", function () {
            let check = $("#checkbox-buss").prop("checked");

            if (check) {
                if ($('.checkbox-buss-class i').hasClass('fa-square')) {
                    $('.checkbox-buss-class i').removeClass('fa-square').addClass('fa-check-square');
                    isBuss = true;
                    isTunnelbana = false;
                    isPendel = false;

                    $(".stop-container").html(filterDepatures(BUSCATCODE));
                    getStopsInTrip(); 

                    loader();
                    $("#checkbox-buss").prop('checked', true);

                    $(".checkbox-tbanna-class i").removeClass("fa-check-square");
                    $(".checkbox-pendel-class i").removeClass("fa-check-square");
                    $(".checkbox-tbanna-class i").addClass("fa-square");
                    $(".checkbox-pendel-class i").addClass("fa-square");

                    $("#checkbox-pendel").prop('checked', false);
                    $("#checkbox-tbanna").prop('checked', false);





                }
            } else {
                if ($('.checkbox-buss-class i').hasClass('fa-check-square')) {
                    $('.checkbox-buss-class i').removeClass('fa-check-square').addClass('fa-square');
                    isBuss = false;
                    $(".stop-container").html(OUTPUTNOFILTER);
                    getStopsInTrip();
                }
            }

        });
    }
});
