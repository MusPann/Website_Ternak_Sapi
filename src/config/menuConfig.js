const menuList = [
  {
    title: "Beranda",
    path: "/dashboard",
    icon: "home",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  },
  {
    title: "Daftar Hewan",
    path: "/hewan",
    icon: "apartment",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Daftar Peternak",
    path: "/peternak",
    icon: "border",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Daftar Petugas",
    path: "/petugas",
    icon: "user",
    roles: ["ROLE_ADMINISTRATOR",],
  },
  {
    title: "Data Kandang",
    path: "/kandang",
    icon: "user",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Daftar Vaksin",
    path: "/vaksin",
    icon: "project",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Inseminasi Buatan",
    path: "/inseminasi-buatan",
    icon: "table",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Kelahiran",
    path: "/kelahiran",
    icon: "file-search",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Pengobatan",
    path: "/pengobatan",
    icon: "experiment",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "PKB",
    path: "/pkb",
    icon: "copy",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {title: "Monitoring",
  path: "/monitoring",
  icon: "camera",
  roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
}
];
export default menuList;
