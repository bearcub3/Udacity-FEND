/******************************************* Model *****************************************************/

const model = {
    currentCat: null,
    cats: [
            {  
                name: 'Ollie',
                image: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
                clicks: 0
            },
            {
                name: 'Beau',
                image: 'https://evenfinancial.com/wp-content/uploads/2016/04/surprisedcat.jpg',
                clicks: 0
            },
            {
                name: 'Shadow',
                image: 'http://s3-us-west-2.amazonaws.com/badbearmedia/wp-content/uploads/2016/03/07101632/94.jpg',
                clicks: 0
            },
            {
                name: 'Benny',
                image: 'https://d17fnq9dkz9hgj.cloudfront.net/breed-uploads/2018/08/scottish-fold-detail.jpg?bust=1535567146&width=630',
                clicks: 0
            },
            {
                name: 'Smokey',
                image: 'https://carwad.net/sites/default/files/black-cat-images-120031-5731269.jpg',
                clicks: 0
            },
            {
                name: 'Oliver',
                image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg',
                clicks: 0
            }
        ]
};

/******************************************* Control(Octopus) *****************************************************/
var octopus = {
    init: function() {
            model.currentCat = model.cats[0];
            catListView.init();
            catImageView.init();
    },
    // to use for catListView
    getCats: function() {
                return model.cats;
    },
    getCurrentCat: function() {
        return model.currentCat;
    },
    // to set the cat passed in as a currentCat
    setCurrentCat: function(cat) {
        model.currentCat = cat;
    },
    clickIncrement: function() {
       model.currentCat['clicks']++;
       catImageView.render();
    }
};

/******************************************* View *****************************************************/
const catListView = {
    init: function() {
            this.render();
    },
    render: function(){
        // to get all the cats we're rendering
        const cats = octopus.getCats();

        for(let cat of cats) {
            const ul = document.querySelector('ul');
            let li = document.createElement('li');
                li.textContent = cat['name'];
                ul.append(li);

                li.addEventListener('click',(function(copiedCat){
                    return function(){
                               octopus.setCurrentCat(copiedCat);
                               catImageView.render();
                    }
                })(cat));    
        }    
    }
};

const catImageView = {
    init: function(){
            this.img = document.querySelector('img');
            this.name = document.querySelector('.cat-name');
            this.clickNum = document.querySelector('.clicks');

            this.img.addEventListener('click', function(e){
                octopus.clickIncrement();
            });

            this.render();
    },
    render: function() {
                let currentCat = octopus.getCurrentCat();
                this.img.setAttribute('src', currentCat['image']);
                this.name.textContent = currentCat['name'];
                this.clickNum.textContent = currentCat['clicks'];
    }
};

octopus.init();