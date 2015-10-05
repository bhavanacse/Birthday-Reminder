//'birthdays' is the collection name to store all documents
Birthdays =  new Mongo.Collection('birthdays');

//Client side code
if (Meteor.isClient) {

  //Subscribe or display the records or documents basing on publishing condition
  Meteor.subscribe("birthdays");

    //Helper functions for the elements present in 'body' tag
    Template.body.helpers({

        //Retrieve all birthdays
        'birthdays': function () {
            return Birthdays.find();
        },

        //Retrieve all birthdays if they match with current month and day (daily birthdays)
        'birthdaysToday': function () {
            var today = new Date();
            var currentMonth = today.getMonth() + 1;
            var currentDay = today.getDate();
            return Birthdays.find({birthMonth: currentMonth, birthDay: currentDay});
        },

        //Retrieve all birthdays if they match with current month (monthly birthdays)
        'nextBirthdays': function () {
            var today = new Date();
            var currentMonth = today.getMonth() + 1;
            return Birthdays.find({birthMonth: currentMonth});
        }
    });

    //Validate the form elements and display the messages if they are empty while adding a birthday to the list
    Template.newBirthDayForm.onRendered(function() {
        $( "#birthdayForm" ).validate({
            rules: {
                firstName : {
                    required: true
                },
                lastName : {
                    required: true
                },
                birthDate: {
                    required: true
                }
            },
            messages: {
                firstName: {
                    required: "First Name is required!"
                },
                lastName: {
                    required: "Last Name is required!"
                },
                birthDate: {
                    required: "Birth Date is required!"
                }
            }
        });
    });

    // Events for the elements in 'body' tag
    Template.body.events({

        //Calendar control
        'click .datepicker': function(){
            $('.datepicker').pickadate({
                selectMonths: true,
                selectYears: true,
                closeOnClear: false,
                max: new Date() + 1,
                editable: false
            });
        },

        //To add a birthday document on click of 'Add Birthday!'
        'submit .new-birthday': function (event) {

            //Prevent the default action of submit button
            event.preventDefault();

            //Get the values entered by the user
            var fN = event.target.firstName.value;
            var lN = event.target.lastName.value;
            var bD = event.target.birthDate.value;

            //Convert the 'birthDate' into a date object
            var myDate = new Date(bD);
            //alert(myDate);

            //Retrieve documents if the details entered by user already exist in database
            var duplicateRecordCount = Birthdays.find({firstName: fN.toLowerCase(), lastName: lN.toLowerCase(), birthDate: myDate.toDateString()}).count();
            //var duplicateRecordCount = Birthdays.find({firstName: fN.toLowerCase(), lastName: lN.toLowerCase(), birthDate: bD}).count();

            //alert(duplicateRecordCount);

            // If duplicate documents exist
            if(duplicateRecordCount >= 1){
                //Display the message
                $('#duplicateRecordText').html("Details already exist. Please enter different details.");
            } else { // Create a document in the 'birthdays' collection
                $('#duplicateRecordText').html("");
                var myMonth = myDate.getMonth() + 1;
                var myDay = myDate.getDate();

                //var myMonth = bD.getMonth() + 1;
                //var myDay = bD.getDate();

                Birthdays.insert({
                    firstName: fN.toLowerCase(),        //First Name
                    lastName: lN.toLowerCase(),         //Last Name
                    birthDate: myDate.toDateString(),   //Birth Date
                    //birthDate: bD,
                    birthMonth: myMonth,                //Birth Month
                    birthDay: myDay,                    //Birth Day
                    createdAt: new Date(),              //Created On
                    owner: Meteor.userId(),             //_id of logged in user
                    username: Meteor.user().username    //username of logged in user
                });
            }

            //Make the fields empty after adding a birthday
            event.target.firstName.value = "";
            event.target.lastName.value = "";
            event.target.birthDate.value = "";

            return false;
        }
    });

    // Events for the template 'birthday'
    Template.birthday.events({
            // To delete a document on click of 'Remove'
            'click .delete': function () {
                Birthdays.remove(this._id);
            }
        }
    );
}

if (Meteor.isServer) {

  // Publish only those documents whose user ID is logged in user ID
  Meteor.publish("birthdays", function(){
        return Birthdays.find({
            owner: this.userId
        });
  });

  Meteor.startup(function () {
    // code to run on server at startup
  });
}
