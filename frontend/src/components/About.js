import React from "react";
import "../styles/About.css";

const About = () => (
  <div className="about-fullpage-bg">
    <div className="about-card">
      <h1 className="about-title">Sobre CouchGarage</h1>
      <p className="about-description">
        <b>CouchGarage</b> es un proyecto desarrollado por dos estudiantes de
        Ingeniería de Software como parte de la asignatura{" "}
        <b>Complemento de Bases de Datos</b>.
      </p>
      <p className="about-description">
        El objetivo principal es realizar una implementación práctica utilizando{" "}
        <b>CouchDB</b>, aplicando los conocimientos adquiridos en clase para
        crear una aplicación real.
      </p>
      <p className="about-team">
        <b>¿Por qué CouchGarage?</b>
        <br />
        Creamos esta aplicación como un ejercicio práctico para aprender a
        trabajar con bases de datos NoSQL y aplicar conceptos de desarrollo web
        completo.
        <br />
        <br />
        <b>Equipo:</b>
        <br />
        Jorge Muñoz Rodríguez - @jormunrod
        <br />
        Alejandro Pérez Santiago - @alepez12
      </p>
    </div>
  </div>
);

export default About;
