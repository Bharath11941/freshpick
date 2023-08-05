
(function ($) {
    "use strict";
  
    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        let jan=Number(document.getElementById("jan").value)
        let feb=Number(document.getElementById("feb").value)
        let mar=Number(document.getElementById("mar").value)
        let apr=Number(document.getElementById("apr").value)
        let may=Number(document.getElementById("may").value)
        let jun=Number(document.getElementById("jun").value)
        let jul=Number(document.getElementById("jul").value)
        let aug=Number(document.getElementById("aug").value)
        let sep=Number(document.getElementById("sep").value)
        let oct=Number(document.getElementById("oct").value)
        let nov=Number(document.getElementById("nov").value)
        let dec=Number(document.getElementById("dec").value)



        


        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                        label: 'Sales',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
                    },
                    // {
                    //     label: 'Users',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(4, 209, 130, 0.2)',
                    //     borderColor: 'rgb(4, 209, 130)',
                        
                    // },
                    // {
                    //     label: 'Products',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    //     borderColor: 'rgb(380, 200, 230)',
                    //     data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
                    // }
  
                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } //End if
    
  })(jQuery);

