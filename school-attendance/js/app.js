const model = {
    students: [{ 
        name: 'Slappy, the Frog',
        attendance: 0,
        absence: 0
    },{
        name: 'Lilly the Lizard',
        attendance: 0,
        absence: 0
    },{
        name: 'Paulrus the Walrus',
        attendance: 0,
        absence: 0
    },{
        name: 'Gregory the Goat',
        attendance: 0,
        absence: 0
    },{
        name: 'Adam the Anaconda',
        attendance: 0,
        absence: 0
    },{
        name: 'Henry the Puss',
        attendance: 0,
        absence: 0
    }],
    schoolDays: 12
};

const octopus = {
    init: function() {
        dayView.init();
        studentView.init();
    },
    getSchoolDays: function(){
        return model.schoolDays;
    },
    getStudents: function(){
        return model.students;
    },
    getStudentAttendance: function(num){
        model.students[num].attendance++;
    },
    cancelAttendance: function(num){
        model.students[num].attendance--;
    },
    getTotalAbsence: function(num){
        model.students[num].absence = model.schoolDays - model.students[num].attendance;
    }
};

const dayView = {
    init: function(){
        this.days = octopus.getSchoolDays();
        this.render();
    },
    render: function(){
        const theadArea = document.querySelector('.thead-area'),
              absence = document.querySelector('.missed-col');
                
        for(let i=1;i<=this.days;i++){
            const th = document.createElement('th');
            th.textContent = i;
            theadArea.insertBefore(th, absence);

            th.addEventListener('click', (function(copiedI){
                return function(){
                    const students = document.querySelectorAll('.student');
                    if(!th.classList.contains('all')){
                        for(let student of students){
                            student.children[copiedI].firstElementChild.checked = true;
                            octopus.getStudentAttendance(student.dataset.number);
                            octopus.getTotalAbsence(student.dataset.number);
                            th.classList.add('all');
                        }
                    }else if(th.classList.contains('all')){
                        return;
                    }
                    studentView.totalAbsence();
                }
            })(th.textContent));
        }
    }
};

const studentView = {
    init: function(){
        this.tbody = document.querySelector('tbody');
        this.students = octopus.getStudents();      
        this.attendanceCheck();
        this.studentsName();
        this.absenceArea();
        this.totalAbsence();
    },
    studentsName: function(){
        const trs = document.querySelectorAll('.student');

        for(let i=0;i<trs.length;i++){
            const td = document.createElement('td');
            td.classList.add('name-col');
            trs[i].insertBefore(td, trs[i].firstElementChild);
        }

        const nameCols = document.querySelectorAll('.name-col');
        
        for(let k=1;k<this.students.length+1;k++){
            nameCols[k].textContent = this.students[k-1]['name'];
        }
    },
    attendanceCheck: function(){
        const days = octopus.getSchoolDays();

        for(let i=0;i<this.students.length;i++){
            const tr = document.createElement('tr');
            tr.classList.add('student');
            tr.dataset.number = i;
            this.tbody.appendChild(tr);

            for(let i=0;i<days;i++){
                const td = document.createElement('td');
                const input = document.createElement('input');
                td.classList.add('attend-col');
                input.setAttribute('type','checkbox');
                td.appendChild(input);
                tr.appendChild(td);
                input.addEventListener('click', (function(copiedNum){
                    return function(e){
                        console.log(e.target);
                        if(e.target.checked){
                            octopus.getStudentAttendance(copiedNum);
                            octopus.getTotalAbsence(copiedNum);
                            studentView.totalAbsence();
                        }else if(!e.target.checked){
                            octopus.cancelAttendance(copiedNum);
                            octopus.getTotalAbsence(copiedNum);
                            studentView.totalAbsence();
                        }
                    }
                })(tr.dataset.number));
            }
        }        
    },
    absenceArea: function(){
        const trs = document.querySelectorAll('.student');
        for(let i=0;i<this.students.length;i++){
            const td = document.createElement('td');
            td.classList.add('missed-col');
            trs[i].appendChild(td);
        }
    },
    totalAbsence: function(){
        const trs = document.querySelectorAll('.student');
        for(let j=0;j<this.students.length;j++){
            trs[j].lastElementChild.textContent = this.students[j].absence;
        }
    }
};

octopus.init();