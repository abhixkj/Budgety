
//Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        })
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            var itemArray = data.allItems[type];

            if (itemArray.length === 0) {
                ID = 0;
            }
            else {
                //Create new Id
                ID = itemArray[itemArray.length - 1].id + 1;
            }

            //Create new Item based on inc or Exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            itemArray.push(newItem);

            //Return the new Element
            return newItem;
        },
        calculateBudget: function () {

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget  : income-expense
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of ioncome that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1
            }


        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };




})();

//UI Controller
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        item__delete: 'item__delete--btn'
    }

    return {
        getInputs: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtlml, element;
            //Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%""><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data
            newHtlml = html.replace('%id%', obj.id);
            newHtlml = newHtlml.replace('%description%', obj.description);
            newHtlml = newHtlml.replace('%value%', obj.value);

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtlml);
        },

        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(element => {
                element.value = '';
            });
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            } else {

                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }


        },

        getDOMstrings: function () {
            return DOMstrings;
        }

    }
})();

//Global APP Controller
var controller = (function (budgetCtrl, UICtrl) {

    var setyUpEventListners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    updateBudget = function () {

        //1. Calc the budget
        budgetCtrl.calculateBudget();

        //2.Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    var ctrlAddItem = function () {
        var input, newItem;
        //1. Get Input Data
        input = UICtrl.getInputs();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            //2. Add the item to the b udget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to ui
            UICtrl.addListItem(newItem, input.type);

            //4.Clear Fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;

        itemId = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemId) {

            //inc-1
            splitId = itemId.split('-');
            type = splitId[0];
            ID = splitId[0];

            //1. DELETE FROM DATA

            //2.DELETE FROM UI

            //3.UPDATE & SHOW Budget

        }


    }

    return {
        init: function () {
            console.log('Applicaion has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setyUpEventListners();
        }
    };
})(budgetController, UIController);


controller.init();
