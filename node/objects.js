const Dog = (name) => {
    const sound = 'wuff!';

    return {
        talk: () => {
            console.log(name + ' says:', sound);
        }
    };
};

const lessie = Dog('Lessie');
lessie.talk();

const hardy = Dog('Hardy');
hardy.talk();