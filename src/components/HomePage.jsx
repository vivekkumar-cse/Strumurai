// src/pages/HomePage.jsx
import React from 'react';
import { FaGuitar, FaRobot, FaMusic } from 'react-icons/fa';
import { Container, Row, Col, Card } from 'react-bootstrap';

const HomePage = () => {
  return (
    <Container className="text-center">
      <h1 className="mb-5 fw-bold">🎸 Welcome to <span className="text-warning">Strumurai</span></h1>
      
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <FaGuitar size={50} className="text-danger mb-3" />
              <Card.Title>Beginner → Custom Mode</Card.Title>
              <Card.Text>
                Learn from presets and then customize your training.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <FaRobot size={50} className="text-primary mb-3" />
              <Card.Title>Intermediate → Auto Chord Generator</Card.Title>
              <Card.Text>
                Use mic to detect and match real-time played chords.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <FaMusic size={50} className="text-success mb-3" />
              <Card.Title>Advanced → Chord Detection</Card.Title>
              <Card.Text>
                Detect played chords and refine your skills.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
