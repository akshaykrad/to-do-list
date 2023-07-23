const addTaskBtn    = document.getElementById('addTaskBtn');
const taskBox       = document.querySelector('.taskBox');
const cancelBtn     = document.querySelector('.btn-cancel');
const addBox        = document.getElementById('task-add-box');
const findBtn       = document.querySelector('.find-btn');
const searchIp      = document.querySelector('.search-ip');

const priorityValues = ["Low","Medium","High","Urgent"];
let idCounter = 0;

function taskSchema(id,title, description, priority, dueDate, category, subtasks){
    let task = {
        id: id,
        title: title,
		description:description,
        priority: priority,
        category: category,
        complete: false,
        subtasks: subtasks,
        dueDate: dueDate,
        created_at: new Date(),
    }
    return task;
}

let tasks = [];

if(JSON.parse(localStorage.getItem('tasks'))){
	tasks = JSON.parse(localStorage.getItem('tasks'));
}
idCounter = tasks.length;

function addTask(event){
	const taskIp   = document.querySelector('.task-ip').value;
	const descIp   = document.querySelector('.desc-ip').value;
	const priority = document.getElementById('dropdown-prior').value;
	const category = document.getElementById('dropdown-cat').value;
	const deadline = document.getElementById('dateTime').value;
	let dueDate;
    if(!deadline){
        dueDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    }else{
        dueDate = new Date(deadline);
    }
	const subtasks = [];
	const newTask = taskSchema(idCounter,taskIp,descIp,priority,dueDate,category,subtasks);
	tasks.push(newTask);
	idCounter++;
	renderTasks();
	document.querySelector('.task-ip').value = '';
	document.querySelector('.desc-ip').value = '';
	document.getElementById('dropdown-prior').value = '0';
	document.getElementById('dropdown-cat').value = 'Routine';
	document.getElementById('dateTime').value = '';
}

function del(e){
	let targetId = e.target.id.slice(4);
	for(let i = 0; i<tasks.length; i++){
        if(tasks[i].id == targetId){
			tasks.splice(i,1);
		}
    }
	renderTasks();
}

function markD(e){
	let targetId = e.target.id.slice(6);
	const btn = document.getElementById(`markU-${targetId}`);
	e.target.classList.add('hide-div');
	btn.classList.remove('hide-div');


	let text = document.getElementById(`task-${targetId}`);
	text.style.textDecoration = 'line-through';
}

function markU(e){
	let targetId = e.target.id.slice(6);
	const btn = document.getElementById(`markD-${targetId}`);
	e.target.classList.add('hide-div');
	btn.classList.remove('hide-div');
	
	
	let text = document.getElementById(`task-${targetId}`);
	text.style.textDecoration = 'none';
}

function save(e){
	let targetId = e.target.id.slice(5);
	for(let i = 0; i<tasks.length; i++){
        if(tasks[i].id == targetId){
			tasks[i].title = document.getElementById(`title-${targetId}`).value;
			tasks[i].description = document.getElementById(`desc-${targetId}`).value;
		}
    }
	localStorage.setItem('tasks',JSON.stringify(tasks));
}

function sorting(){
	const picked = document.getElementById('dropdown-sort');
	if(picked.value == "Deadline"){
		tasks.sort(sortByDueDate);
	}
	else if(picked.value == "Priority"){
		tasks.sort(sortByPriority);
	}
	else{
		tasks.sort(sortByCreatedAt);
	}
	renderTasks();
}

function sortByPriority(a,b){
	return b.priority - a.priority;
}
function sortByDueDate(a,b){
	return  new Date(a.dueDate) - new Date(b.dueDate);
}
function sortByCreatedAt(a,b){
	return  new Date(a.created_at) - new Date(b.created_at);
}

function searchItems(query) {
	const filteredItems = tasks.filter(item => {
	  return (
		item.title.toLowerCase().includes(query.toLowerCase()) ||
		item.description.toLowerCase().includes(query.toLowerCase())
	  );
	});
	return filteredItems;
}
  
function showSearch(){
	const searchQuery = searchIp.value;
	const searchResults = searchItems(searchQuery);
	taskBox.innerHTML = "";
	searchResults.forEach(event=>{
		if(event){
			taskBox.innerHTML += 
			schemaDraw(event);
		}
	});
}

addTaskBtn.addEventListener('click',e=>{
	addBox.classList.remove("hide-div");
	e.target.classList.add("hide-div");
});

cancelBtn.addEventListener('click',e=>{
	addBox.classList.add("hide-div");
	addTaskBtn.classList.remove("hide-div");
});

function extractDate(todoText) {
	// Define regular expressions to match different date and time formats
	const dateRegex = [
	  /\b(?:tomorrow|today)\b/i,
	  /\b(\d{1,2}(?:st|nd|rd|th)?)\s+([a-zA-Z]+)\s+(\d{2,4})\b/i, // e.g., 13th Jan 2023
	  /\b(\d{1,2}(?:st|nd|rd|th)?)\s+([a-zA-Z]+)\s+(\d{2,4})\s+(\d{1,2}):(\d{2})\s*([ap]m)?\b/i, // e.g., 13th Jan 2023 3 pm
	];
  
	let dueDate = null;
	for (const pattern of dateRegex) {
	  const match = todoText.match(pattern);
	  console.log(match);
	  if (match) {
		if(match[0]=='tomorrow'){
			dueDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
			break;
		}
		else if(match[0]=='today'){
			dueDate = new Date();
			break;
		}
		let day = parseInt(match[1], 10);
		const month = match[2];
		const year = parseInt(match[3], 10);
  
		// Handle "st," "nd," "rd," "th" in the day and convert it to a valid number
		if (isNaN(day)) {
		  day = parseInt(match[1].slice(0, -2), 10);
		}
  
		const hours = match[4] ? parseInt(match[4], 10) : 0;
		const minutes = match[5] ? parseInt(match[5], 10) : 0;
		const isPM = match[6] && match[6].toLowerCase() === 'pm';
  
		// Create a new Date object for the extracted date and time
		dueDate = new Date(year, getMonthNumber(month), day, hours + (isPM && hours !== 12 ? 12 : 0), minutes);
		break; // Found a valid date/time pattern, exit the loop
	  }
	}
	return dueDate;
  }
  
function getMonthNumber(month) {
	const monthNames = [
	'jan', 'feb', 'mar', 'apr', 'may', 'jun',
	'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
	];
	const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
	return monthIndex === -1 ? 0 : monthIndex;
}

function schemaDraw(event){
	let description = event.description;
	let dueDate = extractDate(description);
	if(dueDate){
		dueDate = dueDate.toLocaleString();
	}
	if(!dueDate){
		dueDate = event.dueDate;
	}
	let outputString = 
	`
	<div id="task-${event.id}" class="task-add-box">
		<input id="title-${event.id}" class="task-ip input" value="${event.title}">
		<input id="desc-${event.id}" class="desc-ip input" value="${event.description}">
		<div class="extra-features">
			<div>
				<strong>Priority</strong>: ${priorityValues[event.priority]}
			</div>
			<div>
				<strong>Category</strong>: ${event.category}
			</div>
			<div>
			<strong>Due date</strong>: ${dueDate.toLocaleString()}
			</div>
			<!-- <div>
				<button class="reminder feature">Reminder</button>
			</div>
			<div>
				<button class="tags feature">Tags</button>
			</div> -->
		</div><hr>
		<div>
			<button id="save-${event.id}" class="btn btn-edit" onclick="save(event)">Save</button>
			<button id="del-${event.id}" class="btn btn-del" onclick="del(event)">Delete</button>
			<button id="markD-${event.id}" class="btn btn-mark" onclick="markD(event)">Mark Complete</button>
			<button id="markU-${event.id}" class="btn btn-mark hide-div" onclick="markU(event)" class="hide-div">Mark Inomplete</button>				
		</div>
	</div>`;
	return outputString;
}
	
function reset(){
	searchIp.value = "";
	document.getElementById('dropdown-sort').value = "Select";
	tasks.sort(sortByCreatedAt);
	renderTasks();
}

searchIp.addEventListener('keypress',e=>{
	if(e.key == 'Enter'){
		showSearch();
	}
});

function renderTasks(){
	taskBox.innerHTML = "";
	tasks.forEach(event=>{
		if(event){
			taskBox.innerHTML += 
			schemaDraw(event);
		}
	});
	localStorage.setItem('tasks',JSON.stringify(tasks));
}

renderTasks();

