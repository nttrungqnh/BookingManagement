
// ===== INIT =====
$("#month").val(new Date().toISOString().slice(0,7));

let selectedDate = new Date().toISOString().slice(0,10);


// ===== UI CONTROL =====
function openMenu(){
  $("#menuModal").addClass("active");
}

function openRoom(){
  closeAll();
  $("#roomModal").addClass("active");
}

function openBooking(){
  closeAll();
  loadRooms();
  $("#bookingModal").addClass("active");
}

function closeAll(){
  $(".modal").removeClass("active");
}


// ===== CLICK DAY =====
function openDay(date){
  selectedDate = date;

  // hiện menu có nút booking theo ngày
  $("#menuModal").addClass("active");

  $("#menuModal").html(`
    <button onclick="openBooking()">+ Booking ${date}</button>
    <button onclick="openRoom()">+ Thêm phòng</button>
  `);
}


// ===== ROOM =====
async function addRoom(){
  try{
    await db.collection("rooms").add({
      code: $("#roomCode").val(),
      type: $("#roomType").val(),
      opCost: Number($("#opCost").val()),
      import: Number($("#import").val()),
      sell: Number($("#sell").val())
    });

    alert("✅ Đã thêm phòng");
    closeAll();

  }catch(e){
    console.error(e);
    alert("❌ Lỗi thêm phòng");
  }
}


// ===== LOAD ROOMS =====
async function loadRooms(){
  let snap = await db.collection("rooms").get();
  $("#room").html("");

  snap.forEach(doc=>{
    let r = doc.data();
    $("#room").append(`
      <option value="${r.code}">
        ${r.code} (${r.type})
      </option>
    `);
  });
}


// ===== GET ROOM =====
async function getRoom(code){
  let snap = await db.collection("rooms")
    .where("code","==",code)
    .get();

  return snap.docs[0]?.data();
}


// ===== BOOKING =====
async function saveBooking(){
  try{
    let room = await getRoom($("#room").val());

    if(!room){
      alert("Chưa có phòng!");
      return;
    }

    await db.collection("bookings").add({
      date: selectedDate,
      room: room.code,
      type: room.type,
      opCost: room.opCost,
      import: room.import,
      sell: room.sell,
      customer: $("#name").val(),
      phone: $("#phone").val(),
      createdAt: new Date()
    });

    alert("✅ Đã lưu booking");
    closeAll();

    renderCalendar();

  }catch(e){
    console.error(e);
    alert("❌ Lỗi booking");
  }
}


// ===== CALENDAR =====
$("#month").change(renderCalendar);

async function renderCalendar(){
  let m = $("#month").val();
  let year = m.split("-")[0];
  let month = m.split("-")[1];

  let days = new Date(year, month, 0).getDate();

  let snap = await db.collection("bookings").get();

  let booked = {};

  snap.forEach(doc=>{
    let d = doc.data();

    if(d.date && d.date.startsWith(m)){
      let day = parseInt(d.date.split("-")[2]);
      booked[day] = true;
    }
  });

  let html = "";

  for(let i=1;i<=days;i++){
    let cls = booked[i] ? "day booked" : "day";

    let dateStr = m + "-" + String(i).padStart(2,'0');

    html += `
      <div class="${cls}" onclick="openDay('${dateStr}')">
        ${i}
      </div>
    `;
  }

  $("#calendar").html(html);
}


// ===== INIT LOAD =====
renderCalendar();

function openRoom(){
  closeAll();
  $("#roomModal").addClass("active");
  $(".overlay").addClass("active");
}

function openBooking(){
  closeAll();
  loadRooms();
  $("#bookingModal").addClass("active");
  $(".overlay").addClass("active");
}

function closeAll(){
  $(".modal").removeClass("active");
  $(".overlay").removeClass("active");
}
