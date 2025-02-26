/* BUDGET CONTROLLER */

var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


   var data = {
       allItems:{
           exp:[],
           inc:[]
       },
       totals:{
           exp:0,
           inc:0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            // create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            // create new items
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            } else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            // push the items
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem:function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/ data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentage:function(){
            var allPer = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPer;
        },

        getBudget: function(){
            return{
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    };
    
})();



/* UI CONTROLLER */

var UIController = (function(){
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerclabel: '.item__percentage',
        DateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type){
        var numSplit, int, dec;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        dec = numSplit[1];

         return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput:function(){
          return {
             type: document.querySelector(DOMStrings.inputType).value,
             description: document.querySelector(DOMStrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
          };
        },
        addListItem : function(obj, type){
            var html, newHtml, element;
            // create html string with placeholder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            // insert the html into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID){
            var elem = document.getElementById(selectorID);
            elem.parentNode.removeChild(elem);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                fieldsArr[0].focus();
            });
        },
        displayBudget: function(obj){
            var type;
            
            obj.budget > 0 ? type ='inc' : type = 'exp'
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0){
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';

            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPerclabel);   

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now,months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.DateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

                nodeListForEach(fields, function(cur){
                    cur.classList.toggle('red-focus');
                });
                document.querySelector('.add__btn').classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMStrings;
        }
    };
})();


/* CONTROLLER */

var controller = (function(budgetctrl, UIctrl){

    var setUpEventListeners = function(){
        var DOM = UIctrl.getDOMstrings;
        document.querySelector('.add__btn').addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
            }
        });

        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
        document.querySelector('.add__type').addEventListener('change', UIctrl.changedType);
    };

    var updateBudget = function(){
        //   1. Calc. budget
        budgetctrl.calculateBudget();

        //   2. Return the budget
        var budget = budgetctrl.getBudget();

        //   3. Display the budget
        UIctrl.displayBudget(budget);
    };

    var updatePercentage = function(){
        // calculate percentage
        budgetctrl.calculatePercentages();

        // read the percentage from budget controller
        var percentages = budgetctrl.getPercentage();

        // update in the UI
       UIctrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function(){
        var input, newItem;

       //   1. get the input field
         input = UIctrl.getInput(); 

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //   2. add item to the input field
        newItem = budgetctrl.addItem(input.type, input.description, input.value);

        //   3. add new item to the UI
            UIctrl.addListItem(newItem, input.type);
    
        //   4. clear fields 
            UIctrl.clearFields();

        //   5. calculate  and update budget
            updateBudget();

        //  6 calculate and update percentages
           updatePercentage(); 

        }  
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID,type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from the DS
            budgetctrl.deleteItem(type,ID);

            // delete the item from the UI
            UIctrl.deleteListItem(itemID);

            // update show the new budget
            updateBudget();

           // calculate and update percentages
             updatePercentage();

        }
            
    };

    return {
        init:function(){
            console.log('this applications works');
            UIctrl.displayMonth();
            UIctrl.displayBudget({       
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1

            });
            setUpEventListeners();
        }
    };
})(budgetController, UIController);
controller.init();
